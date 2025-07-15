import { Hono } from "hono";
import { z } from "zod";
import { db } from "@repo/database";
import { validator } from "hono-openapi/zod";
import { authMiddleware } from "../middleware/auth";

// Service creation schema (categoryId is required)
const createServiceSchema = z.object({
	name: z.string().min(2),
	description: z.string().min(5),
	price: z.number().positive(),
	duration: z.number().int().positive(),
	categoryId: z.string().cuid(),
});

export const servicesRouter = new Hono()
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

		const service = await db.service.create({
			data: {
				name: data.name,
				description: data.description,
				price: data.price,
				duration: data.duration,
				categoryId: data.categoryId,
				providerId: user.id,
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
				...(includeRatings && {
					bookings: {
						include: {
							review: {
								select: {
									rating: true,
									createdAt: true,
								}
							}
						}
					}
				})
			},
		});
		
		// Calculate rating statistics if requested
		const servicesWithRatings = includeRatings ? services.map(service => {
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
		}) : services;
		
		return c.json({ services: servicesWithRatings });
	})
	// Get a service by ID
	.get(":id", async (c) => {
		const id = c.req.param("id");
		console.log(`[Services API] Fetching service with ID: ${id}`);
		
		if (!id || id.trim() === '') {
			return c.json({ error: "Service ID is required" }, 400);
		}
		
		// Validate service ID format (alphanumeric with underscores and hyphens)
		if (!z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/).safeParse(id).success) {
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
					bookings: {
						include: {
							review: {
								select: {
									rating: true,
									createdAt: true,
								}
							}
						}
					}
				},
			});
			
			if (!service) {
				console.log(`[Services API] Service not found for ID: ${id}`);
				return c.json({ error: "Service not found" }, 404);
			}
			
			console.log(`[Services API] Successfully found service: ${service.name}`);
			
			// Calculate rating statistics
			const reviews = service.bookings?.map(booking => booking.review).filter(Boolean) || [];
			const totalReviews = reviews.length;
			const averageRating = totalReviews > 0 
				? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
				: 0;
			
			const serviceWithRatings = {
				...service,
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
		if (!z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/).safeParse(id).success) {
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
		if (!z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/).safeParse(id).success) {
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
