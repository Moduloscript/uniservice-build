import { Hono } from "hono";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@repo/database";
import { validator } from "hono-openapi/zod";
import { authMiddleware } from "../middleware/auth";
import {
	updateAvailabilityOnBookingCreate,
	updateAvailabilityOnBookingCancel,
	validateBookingAvailability,
} from "../utils/availability-sync";
import { createEarningsFromCompletedBooking, calculatePlatformFee } from "../utils/earnings-helper";
import { logger } from "@repo/logs";
import { sendEmail } from "@repo/mail";

// Create booking schema
const createBookingSchema = z.object({
	serviceId: z.string().uuid(),
	scheduledFor: z.string().datetime(),
});

// Update booking schema
const updateBookingSchema = z.object({
	status: z
		.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED"])
		.optional(),
});

export const bookingsRouter = new Hono()
	.use(authMiddleware)
	// Create a new booking
	.post("/", validator("json", createBookingSchema), async (c) => {
		const user = c.get("user");
		const data = c.req.valid("json");

		// Verify user is a student
		if (user.userType !== "STUDENT") {
			return c.json({ error: "Only students can create bookings" }, 403);
		}

	// Verify service exists
	const service = await db.service.findUnique({
		where: { id: data.serviceId },
		include: { category: true },
	});
	if (!service) {
		return c.json({ error: "Service not found" }, 404);
	}

	// Validate availability before creating booking
	const availabilityCheck = await validateBookingAvailability(
		service.providerId,
		data.serviceId,
		new Date(data.scheduledFor)
	);

	if (!availabilityCheck.isValid) {
		return c.json(
			{ error: availabilityCheck.message || "Time slot not available" },
			400
		);
	}

	// Create booking in a transaction with availability update
	const result = await db.$transaction(async (prisma) => {
		// Create the booking
		const booking = await prisma.booking.create({
			data: {
				id: crypto.randomUUID(),
				studentId: user.id,
				providerId: service.providerId,
				serviceId: data.serviceId,
				scheduledFor: new Date(data.scheduledFor),
				status: "PENDING",
			},
			include: {
				service: { include: { category: true } },
			},
		});

		// Update availability (outside transaction to avoid blocking)
		setImmediate(async () => {
			const syncResult = await updateAvailabilityOnBookingCreate(
				service.providerId,
				data.serviceId,
				new Date(data.scheduledFor)
			);
			if (!syncResult.success) {
				logger.warn("Failed to sync availability:", { message: syncResult.message });
			}
		});

		return booking;
	});

	return c.json({ 
		booking: result,
		message: "Booking created successfully"
	});
	})
	// Get all bookings for current user
	.get("/", async (c) => {
		const user = c.get("user");

		// Build query based on user type
		let whereClause = {};
		if (user.userType === "STUDENT") {
			whereClause = { studentId: user.id };
		} else if (user.userType === "PROVIDER") {
			whereClause = { providerId: user.id };
		} else if (user.userType === "ADMIN") {
			// Admin can see all bookings
			whereClause = {};
		} else {
			return c.json({ error: "Unauthorized" }, 403);
		}

		const bookings = await db.booking.findMany({
			where: whereClause,
			include: {
				service: { include: { category: true } },
			},
			orderBy: { createdAt: "desc" },
		});
		return c.json({ bookings });
	})
	// Get a specific booking by ID
	.get(":id", async (c) => {
		const id = c.req.param("id");
		const user = c.get("user");

		if (!z.string().uuid().safeParse(id).success) {
			return c.json({ error: "Invalid booking ID" }, 400);
		}

		const booking = await db.booking.findUnique({
			where: { id },
			include: {
				service: { include: { category: true } },
			},
		});

		if (!booking) {
			return c.json({ error: "Booking not found" }, 404);
		}

		// Check authorization
		if (
			user.userType !== "ADMIN" &&
			booking.studentId !== user.id &&
			booking.providerId !== user.id
		) {
			return c.json({ error: "Unauthorized" }, 403);
		}

		return c.json({ booking });
	})
	// Update a booking status (providers can confirm/complete, students can cancel)
	.put(":id", validator("json", updateBookingSchema), async (c) => {
		const id = c.req.param("id");
		const user = c.get("user");
		const data = c.req.valid("json");

		if (!z.string().uuid().safeParse(id).success) {
			return c.json({ error: "Invalid booking ID" }, 400);
		}

		const booking = await db.booking.findUnique({ where: { id } });
		if (!booking) {
			return c.json({ error: "Booking not found" }, 404);
		}

		// Check authorization and allowed status transitions
		if (user.userType === "PROVIDER" && booking.providerId === user.id) {
			// Providers can confirm pending bookings or mark as completed
			if (
				data.status &&
				!["CONFIRMED", "COMPLETED", "CANCELLED"].includes(data.status)
			) {
				return c.json(
					{ error: "Invalid status transition for provider" },
					400,
				);
			}
		} else if (
			user.userType === "STUDENT" &&
			booking.studentId === user.id
		) {
			// Students can only cancel their bookings
			if (data.status && data.status !== "CANCELLED") {
				return c.json(
					{ error: "Students can only cancel bookings" },
					400,
				);
			}
		} else if (user.userType !== "ADMIN") {
			return c.json({ error: "Unauthorized" }, 403);
		}

	const updatedBooking = await db.booking.update({
		where: { id },
		data: data,
		include: {
			service: { include: { category: true } },
		},
	});

	// Handle availability sync for status changes
	if (data.status === "CANCELLED") {
		// Update availability after cancellation
		setImmediate(async () => {
			const syncResult = await updateAvailabilityOnBookingCancel(
				updatedBooking.providerId,
				updatedBooking.serviceId,
				updatedBooking.scheduledFor
			);
			if (!syncResult.success) {
				logger.warn("Failed to sync availability on status change:", { message: syncResult.message });
			}
		});
	}

  // Create earnings if booking is completed - using transaction for safety
  if (data.status === "COMPLETED") {
    try {
      await db.$transaction(async (tx) => {
        // Verify the booking is indeed completed within the transaction
        const completedBooking = await tx.booking.findUnique({
          where: { id: updatedBooking.id },
          include: {
            service: true,
            provider: { select: { id: true, name: true, email: true } },
            student: { select: { id: true, name: true } }
          }
        });

        if (!completedBooking || completedBooking.status !== "COMPLETED") {
          throw new Error(`Booking ${updatedBooking.id} is not in completed status`);
        }

        // Check if earnings already exist to prevent duplicates
        const existingEarning = await tx.earning.findUnique({
          where: { bookingId: updatedBooking.id }
        });

        if (existingEarning) {
          logger.warn(`Earnings already exist for booking ${updatedBooking.id}`, {
            earningId: existingEarning.id,
            providerId: completedBooking.providerId
          });
          return;
        }

        // Calculate earnings amounts using configurable platform fee
        const grossAmount = Number(completedBooking.service.price);
        const platformFee = calculatePlatformFee(grossAmount);
        const netAmount = grossAmount - platformFee;

        // Create earnings record within the transaction
        await tx.earning.create({
          data: {
            providerId: completedBooking.providerId,
            bookingId: completedBooking.id,
            grossAmount: grossAmount,
            platformFee: platformFee,
            amount: netAmount,
            currency: "NGN",
            status: "PENDING_CLEARANCE",
            metadata: {
              serviceName: completedBooking.service.name,
              studentName: completedBooking.student.name,
              completedAt: new Date().toISOString(),
              bookingScheduledFor: completedBooking.scheduledFor?.toISOString() || new Date().toISOString()
            }
          }
        });

        logger.info("Earnings created successfully in transaction", {
          bookingId: completedBooking.id,
          providerId: completedBooking.providerId,
          providerName: completedBooking.provider.name,
          grossAmount,
          platformFee,
          netAmount,
          serviceName: completedBooking.service.name
        });

        // Send earnings notification email to provider
        setImmediate(async () => {
          try {
            const emailSent = await sendEmail({
              to: completedBooking.provider.email,
              templateId: "earningsNotification",
              context: {
                name: completedBooking.provider.name,
                serviceName: completedBooking.service.name,
                clientName: completedBooking.student.name,
                earningsAmount: netAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 }),
                totalAmount: grossAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 }),
                platformFee: platformFee.toLocaleString('en-NG', { minimumFractionDigits: 2 }),
                dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app/provider/earnings`
              }
            });
            
            if (emailSent) {
              logger.info("Earnings notification email sent successfully", {
                bookingId: completedBooking.id,
                providerId: completedBooking.providerId,
                providerEmail: completedBooking.provider.email
              });
            } else {
              logger.warn("Failed to send earnings notification email", {
                bookingId: completedBooking.id,
                providerId: completedBooking.providerId,
                providerEmail: completedBooking.provider.email
              });
            }
          } catch (emailError) {
            logger.error("Error sending earnings notification email", {
              bookingId: completedBooking.id,
              providerId: completedBooking.providerId,
              providerEmail: completedBooking.provider.email,
              error: emailError.message
            });
          }
        });
      });
    } catch (error) {
      logger.error("Failed to create earnings for booking in transaction", {
        bookingId: updatedBooking.id,
        error: error.message,
      });
      
      // Even if earnings creation fails, the booking status update should succeed
      // This maintains data consistency while alerting about the earnings issue
    }
  }

  return c.json({ 
    booking: updatedBooking,
    message: data.status === "CANCELLED" ? "Booking cancelled and availability updated" : "Booking status updated"
  });
	})
	// Delete/cancel a booking
	.delete(":id", async (c) => {
		const id = c.req.param("id");
		const user = c.get("user");

		if (!z.string().uuid().safeParse(id).success) {
			return c.json({ error: "Invalid booking ID" }, 400);
		}

		const booking = await db.booking.findUnique({ where: { id } });
		if (!booking) {
			return c.json({ error: "Booking not found" }, 404);
		}

		// Check authorization
		if (user.userType !== "ADMIN" && booking.studentId !== user.id) {
			return c.json(
				{
					error: "Only students can delete their own bookings or admins",
				},
				403,
			);
		}

	// Instead of deleting, update status to CANCELLED for audit trail
	const cancelledBooking = await db.booking.update({
		where: { id },
		data: { status: "CANCELLED" },
		include: {
			service: true,
		},
	});

	// Update availability after cancellation
	setImmediate(async () => {
	const syncResult = await updateAvailabilityOnBookingCancel(
		cancelledBooking.providerId,
		cancelledBooking.serviceId,
		cancelledBooking.scheduledFor
	);
		if (!syncResult.success) {
			logger.warn("Failed to sync availability on cancellation:", { message: syncResult.message });
		}
	});

	return c.json({ 
		success: true, 
		booking: cancelledBooking,
		message: "Booking cancelled and availability updated"
	});
	});
