import { Hono } from "hono";
import { db } from "@repo/database";
import { authMiddleware } from "../../middleware/auth";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono();

// Query parameters validation schema
const bookingsQuerySchema = z.object({
	status: z.enum(["all", "upcoming", "completed", "cancelled", "pending", "confirmed"]).optional().default("all"),
	page: z.string().transform(Number).pipe(z.number().min(1)).optional().default(1),
	limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional().default(10),
	sortBy: z.enum(["dateTime", "createdAt", "updatedAt"]).optional().default("dateTime"),
	sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Get student bookings with filtering and pagination
app.get("/", authMiddleware, zValidator("query", bookingsQuerySchema), async (c) => {
	const user = c.get("user");

	if (!user) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	if (user.userType !== "STUDENT") {
		return c.json({ error: "Access denied" }, 403);
	}

	const { status, page, limit, sortBy, sortOrder } = c.req.valid("query");

	try {
		// Build where condition based on status filter
		let whereCondition: any = {
			studentId: user.id,
		};

		switch (status) {
			case "upcoming":
				whereCondition.status = {
					in: ["PENDING", "CONFIRMED"],
				};
				whereCondition.dateTime = {
					gte: new Date(),
				};
				break;
			case "completed":
				whereCondition.status = "COMPLETED";
				break;
			case "cancelled":
				whereCondition.status = "CANCELLED";
				break;
			case "pending":
				whereCondition.status = "PENDING";
				break;
			case "confirmed":
				whereCondition.status = "CONFIRMED";
				break;
			// "all" case - no status filter needed
		}

		// Calculate pagination
		const skip = (page - 1) * limit;

		// Get total count for pagination
		const totalCount = await db.booking.count({
			where: whereCondition,
		});

		// Fetch bookings with pagination and sorting
		const bookings = await db.booking.findMany({
			where: whereCondition,
			include: {
				service: {
					select: {
						id: true,
						name: true,
						price: true,
						duration: true,
						description: true,
						category: {
							select: {
								name: true,
							},
						},
					},
				},
				provider: {
					select: {
						id: true,
						name: true,
						image: true,
						email: true,
					},
				},
				payment: {
					select: {
						id: true,
						amount: true,
						status: true,
						paymentMethod: true,
						transactionRef: true,
					},
				},
			},
			orderBy: {
				[sortBy]: sortOrder,
			},
			skip,
			take: limit,
		});

		// Calculate pagination metadata
		const totalPages = Math.ceil(totalCount / limit);
		const hasNext = page < totalPages;
		const hasPrev = page > 1;

		return c.json({
			success: true,
			data: {
				bookings: bookings.map((booking) => ({
					id: booking.id,
					dateTime: booking.dateTime,
					status: booking.status,
					createdAt: booking.createdAt,
					updatedAt: booking.updatedAt,
					service: booking.service,
					provider: booking.provider,
					payment: booking.payment,
				})),
				pagination: {
					page,
					limit,
					totalCount,
					totalPages,
					hasNext,
					hasPrev,
				},
				filters: {
					status,
					sortBy,
					sortOrder,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching student bookings:", error);
		return c.json(
			{
				success: false,
				error: "Failed to fetch bookings",
			},
			500,
		);
	}
});

// Get booking details by ID
app.get("/:id", authMiddleware, async (c) => {
	const user = c.get("user");
	const bookingId = c.req.param("id");

	if (!user) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	if (user.userType !== "STUDENT") {
		return c.json({ error: "Access denied" }, 403);
	}

	try {
		const booking = await db.booking.findFirst({
			where: {
				id: bookingId,
				studentId: user.id,
			},
			include: {
				service: {
					include: {
						category: true,
						features: true,
						outcomes: true,
					},
				},
				provider: {
					select: {
						id: true,
						name: true,
						image: true,
						email: true,
					},
				},
				payment: true,
				review: {
					select: {
						id: true,
						rating: true,
						comment: true,
						createdAt: true,
					},
				},
			},
		});

		if (!booking) {
			return c.json(
				{
					success: false,
					error: "Booking not found",
				},
				404,
			);
		}

		return c.json({
			success: true,
			data: booking,
		});
	} catch (error) {
		console.error("Error fetching booking details:", error);
		return c.json(
			{
				success: false,
				error: "Failed to fetch booking details",
			},
			500,
		);
	}
});

export default app;
