import { Hono } from "hono";
import { z } from "zod";
import { db } from "@repo/database";
import { validator } from "hono-openapi/zod";
import { authMiddleware } from "../middleware/auth";
import { serviceDeduplicationMiddleware } from "../middleware/deduplication";

// Service creation schema (categoryId is required)
const createServiceSchema = z.object({
	name: z.string().min(2),
	description: z.string().min(5),
	price: z.number().positive(),
	duration: z.number().int().positive(),
	categoryId: z.string().min(1), // Changed from cuid() to accept slug format
});

export const servicesRouter = new Hono()
	// Apply deduplication middleware to prevent double submissions
	.use(serviceDeduplicationMiddleware)
	// Create a new service
	.post("/", authMiddleware, validator("json", createServiceSchema), async (c) => {
		const user = c.get("user");
		const data = c.req.valid("json");

		// Validate categoryId exists
		const category = await db.serviceCategory.findUnique({
			where: { id: data.categoryId },
		});
		if (!category) {
			return c.json({ error: "Invalid categoryId" }, 400);
		}

		// Generate a unique ID for the service
		const serviceId = crypto.randomUUID();
		const now = new Date();
		
		const service = await db.service.create({
			data: {
				id: serviceId,
				name: data.name,
				description: data.description,
				price: data.price,
				duration: data.duration,
				categoryId: data.categoryId,
				providerId: user.id,
				updatedAt: now,
			},
		});
		return c.json({ service });
	})
	// List all services (optionally filter by categoryId and/or providerId)
	.get("/", async (c) => {
		const categoryId = c.req.query("categoryId");
		const providerId = c.req.query("providerId");
		const includeRatings = c.req.query("includeRatings") === "true";
		
		const where: any = {};
		if (categoryId) where.categoryId = categoryId;
		if (providerId) where.providerId = providerId;
		
const services = await db.service.findMany({
			where,
			include: { 
				category: true,
				provider: {
					select: {
						id: true,
						name: true,
						email: true,
						userType: true,
						verified: true,
						isVerified: true,
						createdAt: true,
						verificationStatus: true,
						department: true,
						level: true,
						providerCategory: true,
						matricNumber: true,
					}
				},
			},
		});

		// Add dynamic fields
		const servicesWithStats = services.map(service => ({
			...service,
			availabilityStatus: service.availabilityStatus || 'LIMITED',
			serviceLevel: service.serviceLevel || 'BEGINNER',
			maxStudents: service.maxStudents || 1
		}));

		const servicesWithRatings = includeRatings ? servicesWithStats.map(service => {
			const reviews = service.bookings?.map(booking => booking.review).filter(Boolean) || [];
			const totalReviews = reviews.length;
			const averageRating = totalReviews > 0 
				? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
				: 0;
			
			return {
				...service,
				bookings: undefined, // Remove bookings from response
				ratingStats: {
					totalReviews,
					averageRating: Number(averageRating.toFixed(1)),
					lastReviewDate: reviews.length > 0 ? reviews[0].createdAt : null,
				}
			};
		}) : servicesWithStats;
		
		return c.json({ services: servicesWithRatings });
	})
	// Get a service by ID
	.get(":id", async (c) => {
		const id = c.req.param("id");
		console.log(`[Services API] Fetching service with ID: ${id}`);
		
		if (!id || id.trim() === '') {
			return c.json({ error: "Service ID is required" }, 400);
		}
		
		// Validate service ID format (UUID format)
		if (!z.string().uuid().safeParse(id).success) {
			console.log(`[Services API] Invalid service ID format for ID: ${id}`);
			return c.json({ error: "Invalid service ID format" }, 400);
		}
		
		try {
const service = await db.service.findUnique({
				where: { id },
				include: { 
					category: true, 
					provider: {
						select: {
							id: true,
							name: true,
							email: true,
							userType: true,
							verified: true,
							isVerified: true,
							createdAt: true,
							verificationStatus: true,
							department: true,
							level: true,
							providerCategory: true,
							matricNumber: true,
						}
					},
				},
			});

			if (!service) {
				console.log(`[Services API] Service not found for ID: ${id}`);
				return c.json({ error: "Service not found" }, 404);
			}

			console.log(`[Services API] Successfully found service: ${service.name}`);

			const serviceWithStats = {
				...service,
				availabilityStatus: service.availabilityStatus || 'LIMITED',
				serviceLevel: service.serviceLevel || 'BEGINNER',
				maxStudents: service.maxStudents || 1
			};
			
			// Calculate rating statistics
const reviews = serviceWithStats.bookings?.map(booking => booking.review).filter(Boolean) || [];
			const totalReviews = reviews.length;
			const averageRating = totalReviews > 0 
				? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
				: 0;

			const serviceWithRatings = {
				...serviceWithStats,
				bookings: undefined, // Remove bookings from response
				ratingStats: {
					totalReviews,
					averageRating: Number(averageRating.toFixed(1)),
					lastReviewDate: reviews.length > 0 ? reviews[0].createdAt : null,
				}
			};
			
			return c.json({ service: serviceWithRatings });
		} catch (error) {
			console.error(`[Services API] Database error for ID ${id}:`, error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})
	// Update a service by ID
	.put(":id", authMiddleware, validator("json", createServiceSchema.partial()), async (c) => {
		const id = c.req.param("id");
		if (!z.string().uuid().safeParse(id).success) {
			return c.json({ error: "Invalid service ID" }, 400);
		}
		const user = c.get("user");
		const data = c.req.valid("json");
		const service = await db.service.findUnique({ where: { id } });
		if (!service) {
			return c.json({ error: "Service not found" }, 404);
		}
		if (service.providerId !== user.id) {
			return c.json({ error: "Unauthorized" }, 403);
		}
		if (data.categoryId) {
			const category = await db.serviceCategory.findUnique({
				where: { id: data.categoryId },
			});
			if (!category) {
				return c.json({ error: "Invalid categoryId" }, 400);
			}
		}
		const updated = await db.service.update({
			where: { id },
			data: {
				...data,
			},
			include: { category: true, provider: true },
		});
		return c.json({ service: updated });
	})
	// Delete a service by ID
	.delete(":id", authMiddleware, async (c) => {
		const id = c.req.param("id");
		if (!z.string().uuid().safeParse(id).success) {
			return c.json({ error: "Invalid service ID" }, 400);
		}
		const user = c.get("user");
		const service = await db.service.findUnique({ where: { id } });
		if (!service) {
			return c.json({ error: "Service not found" }, 404);
		}
		if (service.providerId !== user.id) {
			return c.json({ error: "Unauthorized" }, 403);
		}
		await db.service.delete({ where: { id } });
		return c.json({ success: true });
	});
