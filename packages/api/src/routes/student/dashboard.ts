import { Hono } from "hono";
import { db } from "@repo/database";
import { authMiddleware } from "../../middleware/auth";

const app = new Hono();

// Dashboard summary endpoint
app.get("/summary", authMiddleware, async (c) => {
	const user = c.get("user");

	if (!user) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	if (user.userType !== "STUDENT") {
		return c.json({ error: "Access denied" }, 403);
	}

	try {
		// Get upcoming bookings
		const upcomingBookings = await db.booking.findMany({
			where: {
				studentId: user.id,
				status: {
					in: ["PENDING", "CONFIRMED"],
				},
				dateTime: {
					gte: new Date(),
				},
			},
			include: {
				service: {
					select: {
						name: true,
						price: true,
						duration: true,
						category: {
							select: {
								name: true,
							},
						},
					},
				},
				provider: {
					select: {
						name: true,
						image: true,
					},
				},
			},
			orderBy: {
				dateTime: "asc",
			},
			take: 5,
		});

		// Get recent completed bookings
		const recentActivity = await db.booking.findMany({
			where: {
				studentId: user.id,
				status: "COMPLETED",
			},
			include: {
				service: {
					select: {
						name: true,
						price: true,
						category: {
							select: {
								name: true,
							},
						},
					},
				},
				provider: {
					select: {
						name: true,
						image: true,
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
			take: 5,
		});

		// Get favorite providers (providers with most bookings)
		const favoriteProviders = await db.booking.groupBy({
			by: ["providerId"],
			where: {
				studentId: user.id,
				status: {
					in: ["CONFIRMED", "COMPLETED"],
				},
			},
			_count: {
				providerId: true,
			},
			orderBy: {
				_count: {
					providerId: "desc",
				},
			},
			take: 3,
		});

		// Get provider details for favorites
		const providerIds = favoriteProviders.map((fp) => fp.providerId);
		const providers = await db.user.findMany({
			where: {
				id: {
					in: providerIds,
				},
			},
			select: {
				id: true,
				name: true,
				image: true,
				_count: {
					select: {
						services: {
							where: {
								isActive: true,
							},
						},
					},
				},
			},
		});

		// Map providers with booking count
		const myProviders = providers.map((provider) => {
			const bookingCount = favoriteProviders.find(
				(fp) => fp.providerId === provider.id,
			)?._count.providerId || 0;
			return {
				...provider,
				bookingCount,
			};
		});

		// Get summary statistics
		const totalBookings = await db.booking.count({
			where: {
				studentId: user.id,
			},
		});

		const completedBookings = await db.booking.count({
			where: {
				studentId: user.id,
				status: "COMPLETED",
			},
		});

		// Calculate total spent from payments using the service price for now
		// until we have a proper payment integration
		const completedBookingsWithService = await db.booking.findMany({
			where: {
				studentId: user.id,
				status: "COMPLETED",
			},
			include: {
				service: {
					select: {
						price: true,
					},
				},
			},
		});

		const totalSpent = completedBookingsWithService.reduce(
			(sum, booking) => sum + Number(booking.service.price),
			0,
		);

		return c.json({
			success: true,
			data: {
				upcomingBookings: upcomingBookings.map((booking) => ({
					id: booking.id,
					dateTime: booking.dateTime,
					status: booking.status,
					service: booking.service,
					provider: booking.provider,
					createdAt: booking.createdAt,
				})),
				recentActivity: recentActivity.map((booking) => ({
					id: booking.id,
					dateTime: booking.dateTime,
					status: booking.status,
					service: booking.service,
					provider: booking.provider,
					updatedAt: booking.updatedAt,
				})),
				myProviders,
				stats: {
					totalBookings,
					completedBookings,
					totalSpent: totalSpent,
					upcomingCount: upcomingBookings.length,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching student dashboard:", error);
		return c.json(
			{
				success: false,
				error: "Failed to fetch dashboard data",
			},
			500,
		);
	}
});

export default app;
