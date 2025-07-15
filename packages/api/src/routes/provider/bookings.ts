import { Hono } from "hono";
import { z } from "zod";
import { db } from "@repo/database";
import { validator } from "hono-openapi/zod";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../../middleware/auth";

// Query parameters schema
const bookingsQuerySchema = z.object({
	page: z.string().optional().transform(val => val ? parseInt(val) : 1),
	limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED", "all"]).optional().default("all"),
	sortBy: z.enum(["dateTime", "createdAt", "updatedAt"]).optional().default("dateTime"),
	sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
	dateFrom: z.string().optional(),
	dateTo: z.string().optional(),
});

export const providerBookingsRouter = new Hono()
	.basePath("/provider/bookings")
	.use(authMiddleware)
	
	// GET /api/provider/bookings - Get all bookings for authenticated provider
	.get("/",
		validator("query", bookingsQuerySchema),
		describeRoute({
			tags: ["Provider Bookings"],
			summary: "Get provider bookings",
			description: "Get all bookings for authenticated provider with pagination, filtering, and sorting",
			responses: {
				200: {
					description: "Provider bookings list",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									bookings: {
										type: "array",
										items: {
											type: "object",
											properties: {
												id: { type: "string" },
												status: { type: "string" },
												dateTime: { type: "string" },
												createdAt: { type: "string" },
												updatedAt: { type: "string" },
												student: {
													type: "object",
													properties: {
														id: { type: "string" },
														name: { type: "string" },
														email: { type: "string" },
														department: { type: "string" },
														level: { type: "number" }
													}
												},
												service: {
													type: "object",
													properties: {
														id: { type: "string" },
														name: { type: "string" },
														price: { type: "number" },
														duration: { type: "number" },
														category: {
															type: "object",
															properties: {
																name: { type: "string" }
															}
														}
													}
												}
											}
										}
									},
									pagination: {
										type: "object",
										properties: {
											page: { type: "number" },
											limit: { type: "number" },
											total: { type: "number" },
											totalPages: { type: "number" },
											hasNext: { type: "boolean" },
											hasPrev: { type: "boolean" }
										}
									}
								}
							}
						}
					}
				},
				403: {
					description: "Unauthorized - Only providers can access their bookings"
				}
			}
		}),
		async (c) => {
			const user = c.get("user");
			const { page, limit, status, sortBy, sortOrder, dateFrom, dateTo } = c.req.valid("query");

			// Verify user is a provider
			if (user.userType !== "PROVIDER") {
				return c.json({ error: "Unauthorized - Only providers can access their bookings" }, 403);
			}

			try {
				// Build where clause
				const whereClause: any = {
					providerId: user.id,
				};

				// Add status filter
				if (status !== "all") {
					whereClause.status = status;
				}

				// Add date range filter
				if (dateFrom || dateTo) {
					whereClause.dateTime = {};
					if (dateFrom) {
						whereClause.dateTime.gte = new Date(dateFrom);
					}
					if (dateTo) {
						whereClause.dateTime.lte = new Date(dateTo);
					}
				}

				// Build order by clause
				const orderBy: any = {};
				orderBy[sortBy] = sortOrder;

				// Calculate pagination
				const skip = (page - 1) * limit;

				// Get total count
				const totalCount = await db.booking.count({
					where: whereClause,
				});

				// Get bookings with related data
				const bookings = await db.booking.findMany({
					where: whereClause,
					include: {
						student: {
							select: {
								id: true,
								name: true,
								email: true,
								department: true,
								level: true,
							},
						},
						service: {
							select: {
								id: true,
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
					},
					orderBy,
					skip,
					take: limit,
				});

				// Calculate pagination metadata
				const totalPages = Math.ceil(totalCount / limit);
				const hasNext = page < totalPages;
				const hasPrev = page > 1;

				return c.json({
					bookings,
					pagination: {
						page,
						limit,
						total: totalCount,
						totalPages,
						hasNext,
						hasPrev,
					},
				});

			} catch (error) {
				console.error("Error fetching provider bookings:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		}
	)

	// GET /api/provider/bookings/recent - Get recent bookings for dashboard
	.get("/recent",
		validator("query", z.object({
			limit: z.string().optional().transform(val => val ? parseInt(val) : 5),
		})),
		describeRoute({
			tags: ["Provider Bookings"],
			summary: "Get recent provider bookings",
			description: "Get recent bookings for authenticated provider for dashboard display",
			responses: {
				200: {
					description: "Recent provider bookings",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									bookings: {
										type: "array",
										items: {
											type: "object",
											properties: {
												id: { type: "string" },
												status: { type: "string" },
												dateTime: { type: "string" },
												createdAt: { type: "string" },
												student: {
													type: "object",
													properties: {
														name: { type: "string" },
														email: { type: "string" }
													}
												},
												service: {
													type: "object",
													properties: {
														name: { type: "string" },
														price: { type: "number" }
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}),
		async (c) => {
			const user = c.get("user");
			const { limit } = c.req.valid("query");

			// Verify user is a provider
			if (user.userType !== "PROVIDER") {
				return c.json({ error: "Unauthorized - Only providers can access their bookings" }, 403);
			}

			try {
				// Get recent bookings
				const bookings = await db.booking.findMany({
					where: {
						providerId: user.id,
					},
					include: {
						student: {
							select: {
								name: true,
								email: true,
							},
						},
						service: {
							select: {
								name: true,
								price: true,
							},
						},
					},
					orderBy: {
						createdAt: 'desc',
					},
					take: limit,
				});

				return c.json({
					bookings,
				});

			} catch (error) {
				console.error("Error fetching recent provider bookings:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		}
	)

	// GET /api/provider/bookings/stats - Get booking statistics
	.get("/stats",
		validator("query", z.object({
			startDate: z.string().optional(),
			endDate: z.string().optional(),
		})),
		describeRoute({
			tags: ["Provider Bookings"],
			summary: "Get provider booking statistics",
			description: "Get booking statistics for authenticated provider including counts by status and time periods",
			responses: {
				200: {
					description: "Provider booking statistics",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									total: { type: "number" },
									byStatus: {
										type: "object",
										properties: {
											pending: { type: "number" },
											confirmed: { type: "number" },
											completed: { type: "number" },
											cancelled: { type: "number" },
											refunded: { type: "number" }
										}
									},
									byTimeframe: {
										type: "object",
										properties: {
											today: { type: "number" },
											thisWeek: { type: "number" },
											thisMonth: { type: "number" },
											lastMonth: { type: "number" }
										}
									}
								}
							}
						}
					}
				}
			}
		}),
		async (c) => {
			const user = c.get("user");
			const { startDate, endDate } = c.req.valid("query");

			// Verify user is a provider
			if (user.userType !== "PROVIDER") {
				return c.json({ error: "Unauthorized - Only providers can access their bookings" }, 403);
			}

			try {
				// Date range setup
				const dateFilter = {
					...(startDate && { gte: new Date(startDate) }),
					...(endDate && { lte: new Date(endDate) })
				};

				// Get current date boundaries
				const now = new Date();
				const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				const weekStart = new Date(todayStart.getTime() - (todayStart.getDay() * 24 * 60 * 60 * 1000));
				const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
				const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
				const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

				// Get booking statistics by status
				const statusStats = await db.booking.groupBy({
					by: ['status'],
					where: {
						providerId: user.id,
						...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
					},
					_count: {
						id: true,
					},
				});

				const total = statusStats.reduce((sum, stat) => sum + stat._count.id, 0);
				const pending = statusStats.find(stat => stat.status === 'PENDING')?._count.id || 0;
				const confirmed = statusStats.find(stat => stat.status === 'CONFIRMED')?._count.id || 0;
				const completed = statusStats.find(stat => stat.status === 'COMPLETED')?._count.id || 0;
				const cancelled = statusStats.find(stat => stat.status === 'CANCELLED')?._count.id || 0;
				const refunded = statusStats.find(stat => stat.status === 'REFUNDED')?._count.id || 0;

				// Get booking statistics by timeframe
				const todayCount = await db.booking.count({
					where: {
						providerId: user.id,
						createdAt: {
							gte: todayStart,
						},
					},
				});

				const thisWeekCount = await db.booking.count({
					where: {
						providerId: user.id,
						createdAt: {
							gte: weekStart,
						},
					},
				});

				const thisMonthCount = await db.booking.count({
					where: {
						providerId: user.id,
						createdAt: {
							gte: monthStart,
						},
					},
				});

				const lastMonthCount = await db.booking.count({
					where: {
						providerId: user.id,
						createdAt: {
							gte: lastMonthStart,
							lte: lastMonthEnd,
						},
					},
				});

				return c.json({
					total,
					byStatus: {
						pending,
						confirmed,
						completed,
						cancelled,
						refunded,
					},
					byTimeframe: {
						today: todayCount,
						thisWeek: thisWeekCount,
						thisMonth: thisMonthCount,
						lastMonth: lastMonthCount,
					},
				});

			} catch (error) {
				console.error("Error fetching provider booking statistics:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		}
	);
