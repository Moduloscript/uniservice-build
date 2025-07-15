import { Hono } from "hono";
import { z } from "zod";
import { db } from "@repo/database";
import { validator } from "hono-openapi/zod";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../../middleware/auth";

// Date range query schema
const dateRangeSchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
});

export const providerDashboardRouter = new Hono()
	.basePath("/provider/dashboard")
	.use(authMiddleware)
	
	// GET /api/provider/dashboard/stats - Get provider dashboard statistics
	.get("/stats",
		validator("query", dateRangeSchema),
		describeRoute({
			tags: ["Provider Dashboard"],
			summary: "Get provider dashboard statistics",
			description: "Get comprehensive dashboard metrics for authenticated provider including services, bookings, revenue, and student stats",
			responses: {
				200: {
					description: "Provider dashboard statistics",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									services: {
										type: "object",
										properties: {
											total: { type: "number" },
											active: { type: "number" },
											inactive: { type: "number" }
										}
									},
									bookings: {
										type: "object",
										properties: {
											total: { type: "number" },
											pending: { type: "number" },
											confirmed: { type: "number" },
											completed: { type: "number" },
											cancelled: { type: "number" }
										}
									},
									revenue: {
										type: "object",
										properties: {
											total: { type: "number" },
											thisMonth: { type: "number" },
											lastMonth: { type: "number" },
											currency: { type: "string" }
										}
									},
									students: {
										type: "object",
										properties: {
											total: { type: "number" },
											active: { type: "number" },
											thisMonth: { type: "number" }
										}
									}
								}
							}
						}
					}
				},
				403: {
					description: "Unauthorized - Only providers can access dashboard stats"
				}
			}
		}),
		async (c) => {
			const user = c.get("user");
			const { startDate, endDate } = c.req.valid("query");

			// Verify user is a provider
			if (user.userType !== "PROVIDER") {
				return c.json({ error: "Unauthorized - Only providers can access dashboard stats" }, 403);
			}

			try {
				// Date range setup
				const dateFilter = {
					...(startDate && { gte: new Date(startDate) }),
					...(endDate && { lte: new Date(endDate) })
				};

				// Get current month boundaries
				const now = new Date();
				const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
				const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
				const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

				// 1. Services Statistics
				const servicesStats = await db.service.groupBy({
					by: ['isActive'],
					where: {
						providerId: user.id,
						...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
					},
					_count: {
						id: true
					}
				});

				const totalServices = servicesStats.reduce((sum, stat) => sum + stat._count.id, 0);
				const activeServices = servicesStats.find(stat => stat.isActive)?._count.id || 0;
				const inactiveServices = servicesStats.find(stat => !stat.isActive)?._count.id || 0;

				// 2. Bookings Statistics
				const bookingsStats = await db.booking.groupBy({
					by: ['status'],
					where: {
						providerId: user.id,
						...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
					},
					_count: {
						id: true
					}
				});

				const totalBookings = bookingsStats.reduce((sum, stat) => sum + stat._count.id, 0);
				const pendingBookings = bookingsStats.find(stat => stat.status === 'PENDING')?._count.id || 0;
				const confirmedBookings = bookingsStats.find(stat => stat.status === 'CONFIRMED')?._count.id || 0;
				const completedBookings = bookingsStats.find(stat => stat.status === 'COMPLETED')?._count.id || 0;
				const cancelledBookings = bookingsStats.find(stat => stat.status === 'CANCELLED')?._count.id || 0;

				// 3. Revenue Statistics
				const revenueData = await db.booking.findMany({
					where: {
						providerId: user.id,
						status: "COMPLETED",
						...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
					},
					include: {
						service: {
							select: {
								price: true
							}
						}
					}
				});

				const totalRevenue = revenueData.reduce((sum, booking) => sum + Number(booking.service.price), 0);

				// This month revenue
				const thisMonthRevenue = await db.booking.findMany({
					where: {
						providerId: user.id,
						status: "COMPLETED",
						createdAt: {
							gte: thisMonthStart,
							lte: now
						}
					},
					include: {
						service: {
							select: {
								price: true
							}
						}
					}
				});

				const thisMonthTotal = thisMonthRevenue.reduce((sum, booking) => sum + Number(booking.service.price), 0);

				// Last month revenue
				const lastMonthRevenue = await db.booking.findMany({
					where: {
						providerId: user.id,
						status: "COMPLETED",
						createdAt: {
							gte: lastMonthStart,
							lte: lastMonthEnd
						}
					},
					include: {
						service: {
							select: {
								price: true
							}
						}
					}
				});

				const lastMonthTotal = lastMonthRevenue.reduce((sum, booking) => sum + Number(booking.service.price), 0);

				// 4. Students Statistics
				const studentsData = await db.booking.findMany({
					where: {
						providerId: user.id,
						...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
					},
					select: {
						studentId: true,
						createdAt: true
					},
					distinct: ['studentId']
				});

				const totalStudents = studentsData.length;

				// Active students (students with bookings in last 30 days)
				const thirtyDaysAgo = new Date();
				thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

				const activeStudentsData = await db.booking.findMany({
					where: {
						providerId: user.id,
						createdAt: {
							gte: thirtyDaysAgo
						}
					},
					select: {
						studentId: true
					},
					distinct: ['studentId']
				});

				const activeStudents = activeStudentsData.length;

				// Students this month
				const thisMonthStudents = studentsData.filter(booking => 
					booking.createdAt >= thisMonthStart && booking.createdAt <= now
				).length;

				// Return comprehensive statistics
				return c.json({
					services: {
						total: totalServices,
						active: activeServices,
						inactive: inactiveServices
					},
					bookings: {
						total: totalBookings,
						pending: pendingBookings,
						confirmed: confirmedBookings,
						completed: completedBookings,
						cancelled: cancelledBookings
					},
					revenue: {
						total: totalRevenue,
						thisMonth: thisMonthTotal,
						lastMonth: lastMonthTotal,
						currency: "NGN"
					},
					students: {
						total: totalStudents,
						active: activeStudents,
						thisMonth: thisMonthStudents
					}
				});

			} catch (error) {
				console.error("Error fetching provider dashboard stats:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		}
	);
