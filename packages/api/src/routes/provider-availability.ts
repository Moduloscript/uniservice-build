import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@repo/database";
import { authMiddleware } from "../middleware/auth";

const app = new Hono();

// Validation schemas
const CreateAvailabilitySchema = z.object({
	serviceId: z.string().optional(),
	date: z.string().date(),
	startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/), // HH:MM:SS format
	endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
	maxBookings: z.number().int().min(1).default(1),
	notes: z.string().optional(),
});

const UpdateAvailabilitySchema = z.object({
	isAvailable: z.boolean().optional(),
	maxBookings: z.number().int().min(1).optional(),
	notes: z.string().optional(),
});

const GetAvailabilityQuerySchema = z.object({
	startDate: z.string().date().optional(),
	endDate: z.string().date().optional(),
	serviceId: z.string().optional(),
});

// GET /api/providers/:providerId/availability - Get provider availability
app.get(
	"/:providerId/availability",
	zValidator("query", GetAvailabilityQuerySchema),
	async (c) => {
		const providerId = c.req.param("providerId");
		const { startDate, endDate, serviceId } = c.req.valid("query");

		try {
			// Build date filter
			const dateFilter: any = {};
			if (startDate) {
				dateFilter.gte = new Date(startDate);
			}
			if (endDate) {
				dateFilter.lte = new Date(endDate);
			}

			// If no date range provided, default to next 30 days
			if (!startDate && !endDate) {
				const today = new Date();
				const futureDate = new Date();
				futureDate.setDate(today.getDate() + 30);

				dateFilter.gte = today;
				dateFilter.lte = futureDate;
			}

			const availability = await db.providerAvailability.findMany({
				where: {
					providerId,
					date: dateFilter,
					...(serviceId && { serviceId }),
					isAvailable: true,
				},
				include: {
					service: {
						select: {
							id: true,
							name: true,
							duration: true,
						},
					},
				},
				orderBy: [{ date: "asc" }, { startTime: "asc" }],
			});

			return c.json({
				success: true,
				data: availability,
			});
		} catch (error) {
			console.error("Error fetching provider availability:", error);
			return c.json(
				{ success: false, error: "Failed to fetch availability" },
				500,
			);
		}
	},
);

// GET /api/providers/:providerId/availability/:serviceId - Get availability for specific service
app.get("/:providerId/availability/:serviceId", async (c) => {
	const providerId = c.req.param("providerId");
	const serviceId = c.req.param("serviceId");

	try {
		const today = new Date();
		const futureDate = new Date();
		futureDate.setDate(today.getDate() + 14); // Next 2 weeks

		const availability = await db.providerAvailability.findMany({
			where: {
				providerId,
				serviceId,
				date: {
					gte: today,
					lte: futureDate,
				},
				isAvailable: true,
			},
			orderBy: [{ date: "asc" }, { startTime: "asc" }],
		});

		return c.json({
			success: true,
			data: availability,
		});
	} catch (error) {
		console.error("Error fetching service availability:", error);
		return c.json(
			{ success: false, error: "Failed to fetch service availability" },
			500,
		);
	}
});

// POST /api/providers/:providerId/availability - Create availability slot (Provider only)
app.post(
	"/:providerId/availability",
	authMiddleware,
	zValidator("json", CreateAvailabilitySchema),
	async (c) => {
		const providerId = c.req.param("providerId");
		const user = c.get("user");
		const { serviceId, date, startTime, endTime, maxBookings, notes } =
			c.req.valid("json");

		// Check if user is the provider or admin
		if (user.id !== providerId && user.userType !== "ADMIN") {
			return c.json(
				{
					success: false,
					error: "Unauthorized to manage this provider's availability",
				},
				403,
			);
		}

		try {
			// Check for overlapping availability slots
			const existingSlot = await db.providerAvailability.findFirst({
				where: {
					providerId,
					date: new Date(date),
					OR: [
						{
							startTime: {
								lte: new Date(`1970-01-01T${endTime}`),
							},
							endTime: {
								gte: new Date(`1970-01-01T${startTime}`),
							},
						},
					],
				},
			});

			if (existingSlot) {
				return c.json(
					{
						success: false,
						error: "Overlapping time slot already exists",
					},
					400,
				);
			}

			const availability = await db.providerAvailability.create({
				data: {
					providerId,
					serviceId,
					date: new Date(date),
					startTime: new Date(`1970-01-01T${startTime}`),
					endTime: new Date(`1970-01-01T${endTime}`),
					maxBookings: maxBookings || 1,
					notes,
				},
				include: {
					service: {
						select: {
							id: true,
							name: true,
							duration: true,
						},
					},
				},
			});

			return c.json({
				success: true,
				data: availability,
				message: "Availability slot created successfully",
			});
		} catch (error) {
			console.error("Error creating availability:", error);
			return c.json(
				{ success: false, error: "Failed to create availability slot" },
				500,
			);
		}
	},
);

// PUT /api/providers/:providerId/availability/:availabilityId - Update availability slot
app.put(
	"/:providerId/availability/:availabilityId",
	authMiddleware,
	zValidator("json", UpdateAvailabilitySchema),
	async (c) => {
		const providerId = c.req.param("providerId");
		const availabilityId = c.req.param("availabilityId");
		const user = c.get("user");
		const updateData = c.req.valid("json");

		// Check if user is the provider or admin
		if (user.id !== providerId && user.userType !== "ADMIN") {
			return c.json(
				{
					success: false,
					error: "Unauthorized to manage this provider's availability",
				},
				403,
			);
		}

		try {
			const availability = await db.providerAvailability.update({
				where: {
					id: availabilityId,
					providerId,
				},
				data: updateData,
				include: {
					service: {
						select: {
							id: true,
							name: true,
							duration: true,
						},
					},
				},
			});

			return c.json({
				success: true,
				data: availability,
				message: "Availability updated successfully",
			});
		} catch (error) {
			console.error("Error updating availability:", error);
			return c.json(
				{ success: false, error: "Failed to update availability" },
				500,
			);
		}
	},
);

// DELETE /api/providers/:providerId/availability/:availabilityId - Delete availability slot
app.delete(
	"/:providerId/availability/:availabilityId",
	authMiddleware,
	async (c) => {
		const providerId = c.req.param("providerId");
		const availabilityId = c.req.param("availabilityId");
		const user = c.get("user");

		// Check if user is the provider or admin
		if (user.id !== providerId && user.userType !== "ADMIN") {
			return c.json(
				{
					success: false,
					error: "Unauthorized to manage this provider's availability",
				},
				403,
			);
		}

		try {
			await db.providerAvailability.delete({
				where: {
					id: availabilityId,
					providerId,
				},
			});

			return c.json({
				success: true,
				message: "Availability slot deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting availability:", error);
			return c.json(
				{ success: false, error: "Failed to delete availability slot" },
				500,
			);
		}
	},
);

// POST /api/providers/:providerId/availability/bulk - Create multiple availability slots
app.post(
	"/:providerId/availability/bulk",
	authMiddleware,
	zValidator(
		"json",
		z.object({
			slots: z.array(CreateAvailabilitySchema),
		}),
	),
	async (c) => {
		const providerId = c.req.param("providerId");
		const user = c.get("user");
		const { slots } = c.req.valid("json");

		// Check if user is the provider or admin
		if (user.id !== providerId && user.userType !== "ADMIN") {
			return c.json(
				{
					success: false,
					error: "Unauthorized to manage this provider's availability",
				},
				403,
			);
		}

		try {
			const createdSlots = await db.$transaction(
				slots.map((slot) =>
					db.providerAvailability.create({
						data: {
							providerId,
							serviceId: slot.serviceId,
							date: new Date(slot.date),
							startTime: new Date(`1970-01-01T${slot.startTime}`),
							endTime: new Date(`1970-01-01T${slot.endTime}`),
							maxBookings: slot.maxBookings || 1,
							notes: slot.notes,
						},
					}),
				),
			);

			return c.json({
				success: true,
				data: createdSlots,
				message: `${createdSlots.length} availability slots created successfully`,
			});
		} catch (error) {
			console.error("Error creating bulk availability:", error);
			return c.json(
				{
					success: false,
					error: "Failed to create availability slots",
				},
				500,
			);
		}
	},
);

export { app as providerAvailabilityRouter };
