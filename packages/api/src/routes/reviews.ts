import { Hono } from "hono";
import { z } from "zod";
import { db } from "@repo/database";
import { validator } from "hono-openapi/zod";
import { authMiddleware } from "../middleware/auth";

// Review creation schema
const createReviewSchema = z.object({
	rating: z.number().int().min(1).max(5),
	comment: z.string().min(1).max(500).optional(),
	bookingId: z.string().min(1).max(50).regex(/^[a-zA-Z0-9]+$/),
});

// Review update schema
const updateReviewSchema = z.object({
	rating: z.number().int().min(1).max(5).optional(),
	comment: z.string().min(1).max(500).optional(),
});

export const reviewsRouter = new Hono()
	// GET /api/reviews/:serviceId/stats - Get rating statistics for a service
	.get(":serviceId/stats", async (c) => {
		const serviceId = c.req.param("serviceId");
		
		if (!serviceId) {
			return c.json({ error: "Service ID is required" }, 400);
		}
		
		
		// Validate service ID format (alphanumeric, 21 characters)
		if (!z.string().min(1).max(50).regex(/^[a-zA-Z0-9]+$/).safeParse(serviceId).success) {
			return c.json({ error: "Invalid service ID format" }, 400);
		}

		try {
			// Verify service exists
			const service = await db.service.findUnique({
				where: { id: serviceId },
			});

			if (!service) {
				return c.json({ error: "Service not found" }, 404);
			}

			// Get all reviews for this service
			const reviews = await db.review.findMany({
				where: {
					booking: {
						serviceId: serviceId,
					},
				},
				select: {
					rating: true,
					createdAt: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			const totalReviews = reviews.length;
			const averageRating = totalReviews > 0 
				? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
				: 0;

			// Calculate rating distribution
			const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
				const rating = i + 1;
				const count = reviews.filter(r => r.rating === rating).length;
				const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
				return { rating, count, percentage };
			}).reverse();

			// Get recent reviews for trend analysis
			const recentReviews = reviews.slice(0, 10);
			const recentAverageRating = recentReviews.length > 0
				? recentReviews.reduce((sum, review) => sum + review.rating, 0) / recentReviews.length
				: 0;

			return c.json({
				serviceId,
				totalReviews,
				averageRating: Number(averageRating.toFixed(1)),
				recentAverageRating: Number(recentAverageRating.toFixed(1)),
				ratingDistribution,
				lastReviewDate: reviews.length > 0 ? reviews[0].createdAt : null,
			});
		} catch (error) {
			console.error("Error fetching service rating statistics:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})
	
	// GET /api/reviews/:serviceId - Fetch all reviews for a service
	.get(":serviceId", async (c) => {
		const serviceId = c.req.param("serviceId");
		
		if (!serviceId) {
			return c.json({ error: "Service ID is required" }, 400);
		}
		
		
		// Validate service ID format (alphanumeric, 21 characters)
		if (!z.string().min(1).max(50).regex(/^[a-zA-Z0-9]+$/).safeParse(serviceId).success) {
			return c.json({ error: "Invalid service ID format" }, 400);
		}

		try {
			// Verify service exists
			const service = await db.service.findUnique({
				where: { id: serviceId },
			});

			if (!service) {
				return c.json({ error: "Service not found" }, 404);
			}

			// Get all reviews for bookings of this service
			const reviews = await db.review.findMany({
				where: {
					booking: {
						serviceId: serviceId,
					},
				},
				include: {
					author: {
						select: {
							id: true,
							name: true,
							userType: true,
						},
					},
					target: {
						select: {
							id: true,
							name: true,
							userType: true,
						},
					},
					booking: {
						select: {
							id: true,
							serviceId: true,
							dateTime: true,
							status: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			return c.json({ reviews });
		} catch (error) {
			console.error("Error fetching reviews for service:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})
	
	// POST /api/reviews - Submit a review
	.post("/", authMiddleware, validator("json", createReviewSchema), async (c) => {
		const user = c.get("user");
		const data = c.req.valid("json");

		try {
			// Verify booking exists and user is authorized
			const booking = await db.booking.findUnique({
				where: { id: data.bookingId },
				include: {
					service: true,
					student: true,
					provider: true,
				},
			});

			if (!booking) {
				return c.json({ error: "Booking not found" }, 404);
			}

			// Check if user is either the student or provider in this booking
			if (booking.studentId !== user.id && booking.providerId !== user.id) {
				return c.json({ error: "Unauthorized to review this booking" }, 403);
			}

			// Check if review already exists for this booking
			const existingReview = await db.review.findUnique({
				where: { bookingId: data.bookingId },
			});

			if (existingReview) {
				return c.json({ error: "Review already exists for this booking" }, 409);
			}

			// Determine the target of the review
			// If the user is the student, they're reviewing the provider
			// If the user is the provider, they're reviewing the student
			const targetId = booking.studentId === user.id ? booking.providerId : booking.studentId;

			// Create the review
			const review = await db.review.create({
				data: {
					rating: data.rating,
					comment: data.comment,
					bookingId: data.bookingId,
					authorId: user.id,
					targetId: targetId,
				},
				include: {
					author: {
						select: {
							id: true,
							name: true,
							userType: true,
						},
					},
					target: {
						select: {
							id: true,
							name: true,
							userType: true,
						},
					},
					booking: {
						select: {
							id: true,
							serviceId: true,
							dateTime: true,
							status: true,
						},
					},
				},
			});

			return c.json({ review }, 201);
		} catch (error) {
			console.error("Error creating review:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})

	// PUT /api/reviews/:reviewId - Update a review (if author)
	.put(":reviewId", authMiddleware, validator("json", updateReviewSchema), async (c) => {
		const reviewId = c.req.param("reviewId");
		const user = c.get("user");
		const data = c.req.valid("json");

		if (!reviewId || !z.string().min(1).max(50).regex(/^[a-zA-Z0-9]+$/).safeParse(reviewId).success) {
			return c.json({ error: "Invalid review ID format" }, 400);
		}

		try {
			// Find the review
			const existingReview = await db.review.findUnique({
				where: { id: reviewId },
				include: {
					author: {
						select: {
							id: true,
							name: true,
							userType: true,
						},
					},
					target: {
						select: {
							id: true,
							name: true,
							userType: true,
						},
					},
					booking: {
						select: {
							id: true,
							serviceId: true,
							dateTime: true,
							status: true,
						},
					},
				},
			});

			if (!existingReview) {
				return c.json({ error: "Review not found" }, 404);
			}

			// Check if user is the author of the review
			if (existingReview.authorId !== user.id) {
				return c.json({ error: "Unauthorized to update this review" }, 403);
			}

			// Update the review
			const updatedReview = await db.review.update({
				where: { id: reviewId },
				data: {
					...(data.rating && { rating: data.rating }),
					...(data.comment !== undefined && { comment: data.comment }),
				},
				include: {
					author: {
						select: {
							id: true,
							name: true,
							userType: true,
						},
					},
					target: {
						select: {
							id: true,
							name: true,
							userType: true,
						},
					},
					booking: {
						select: {
							id: true,
							serviceId: true,
							dateTime: true,
							status: true,
						},
					},
				},
			});

			return c.json({ review: updatedReview });
		} catch (error) {
			console.error("Error updating review:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})

	// DELETE /api/reviews/:reviewId - Delete a review (if admin or author)
	.delete(":reviewId", authMiddleware, async (c) => {
		const reviewId = c.req.param("reviewId");
		const user = c.get("user");

		if (!reviewId || !z.string().min(1).max(50).regex(/^[a-zA-Z0-9]+$/).safeParse(reviewId).success) {
			return c.json({ error: "Invalid review ID format" }, 400);
		}

		try {
			// Find the review
			const existingReview = await db.review.findUnique({
				where: { id: reviewId },
			});

			if (!existingReview) {
				return c.json({ error: "Review not found" }, 404);
			}

			// Check if user is the author of the review or an admin
			if (existingReview.authorId !== user.id && user.role !== "admin") {
				return c.json({ error: "Unauthorized to delete this review" }, 403);
			}

			// Delete the review
			await db.review.delete({
				where: { id: reviewId },
			});

			return c.json({ success: true });
		} catch (error) {
			console.error("Error deleting review:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	});
