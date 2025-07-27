import { Hono } from "hono";
import { z } from "zod";
import { db } from "@repo/database";
import { validator } from "hono-openapi/zod";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../../middleware/auth";

// Query schemas
const dashboardSummaryQuerySchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
});

const earningsQuerySchema = z.object({
	page: z.string().transform(val => parseInt(val) || 1).optional(),
	limit: z.string().transform(val => Math.min(parseInt(val) || 20, 100)).optional(),
	status: z.enum(["PENDING_CLEARANCE", "AVAILABLE", "PAID_OUT", "FROZEN"]).optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	cursor: z.string().optional(),
});

const analyticsQuerySchema = z.object({
	report: z.enum(["earnings_by_service", "earnings_over_time", "bookings_over_time"]),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	period: z.enum(["day", "week", "month"]).default("month"),
});

const payoutRequestSchema = z.object({
	amount: z.number().positive("Payout amount must be positive"),
	accountNumber: z.string().min(10, "Account number must be at least 10 characters"),
	accountName: z.string().min(3, "Account name is required"),
	bankCode: z.string().min(3, "Bank code is required"),
	bankName: z.string().min(3, "Bank name is required"),
	paymentProvider: z.enum(["PAYSTACK", "FLUTTERWAVE"]),
});

export const providerEarningsRouter = new Hono()
	.basePath("/provider")
	.use(authMiddleware)

	// GET /api/provider/dashboard-summary - Enhanced dashboard with earnings data
	.get(
		"/dashboard-summary",
		validator("query", dashboardSummaryQuerySchema),
		describeRoute({
			tags: ["Provider Earnings"],
			summary: "Get comprehensive provider dashboard summary",
			description: "Get dashboard metrics including earnings, payouts, and financial analytics",
			responses: {
				200: {
					description: "Dashboard summary with earnings data",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									data: {
										type: "object",
										properties: {
											earnings: {
												type: "object",
												properties: {
													totalLifetime: { type: "number" },
													availableBalance: { type: "number" },
													pendingClearance: { type: "number" },
													thisMonth: { type: "number" },
													lastMonth: { type: "number" },
													currency: { type: "string" },
												},
											},
											payouts: {
												type: "object",
												properties: {
													totalPaidOut: { type: "number" },
													pendingPayouts: { type: "number" },
													lastPayoutDate: { type: "string" },
												},
											},
											performance: {
												type: "object",
												properties: {
													totalBookings: { type: "number" },
													completedBookings: { type: "number" },
													averageRating: { type: "number" },
													totalStudents: { type: "number" },
												},
											},
										},
									},
								},
							},
						},
					},
				},
				403: {
					description: "Unauthorized - Only providers can access this endpoint",
				},
			},
		}),
		async (c) => {
			const user = c.get("user");
			const { startDate, endDate } = c.req.valid("query");

			// Verify user is a provider
			if (user.userType !== "PROVIDER") {
				return c.json({ error: "Unauthorized - Only providers can access earnings data" }, 403);
			}

			try {
				// Date range setup
				const dateFilter = {
					...(startDate && { gte: new Date(startDate) }),
					...(endDate && { lte: new Date(endDate) }),
				};

				// Current month boundaries
				const now = new Date();
				const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
				const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
				const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

				// 1. Earnings Summary
				const [totalEarnings, availableEarnings, pendingEarnings] = await Promise.all([
					// Total lifetime earnings
					db.earning.aggregate({
						where: {
							providerId: user.id,
							...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
						},
						_sum: { amount: true },
					}),
					// Available balance
					db.earning.aggregate({
						where: {
							providerId: user.id,
							status: "AVAILABLE",
						},
						_sum: { amount: true },
					}),
					// Pending clearance
					db.earning.aggregate({
						where: {
							providerId: user.id,
							status: "PENDING_CLEARANCE",
						},
						_sum: { amount: true },
					}),
				]);

				// This month earnings
				const thisMonthEarnings = await db.earning.aggregate({
					where: {
						providerId: user.id,
						createdAt: { gte: thisMonthStart, lte: now },
					},
					_sum: { amount: true },
				});

				// Last month earnings
				const lastMonthEarnings = await db.earning.aggregate({
					where: {
						providerId: user.id,
						createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
					},
					_sum: { amount: true },
				});

				// 2. Payout Summary
				const [totalPayouts, pendingPayouts, lastPayout] = await Promise.all([
					// Total paid out
					db.payout.aggregate({
						where: {
							providerId: user.id,
							status: "COMPLETED",
						},
						_sum: { amount: true },
					}),
					// Pending payouts
					db.payout.aggregate({
						where: {
							providerId: user.id,
							status: { in: ["REQUESTED", "PROCESSING"] },
						},
						_sum: { amount: true },
					}),
					// Last payout
					db.payout.findFirst({
						where: {
							providerId: user.id,
							status: "COMPLETED",
						},
						orderBy: { processedAt: "desc" },
						select: { processedAt: true },
					}),
				]);

				// 3. Performance metrics (reusing existing logic from dashboard.ts)
				const [totalBookings, completedBookings, averageRating, totalStudents] = await Promise.all([
					db.booking.count({
						where: { providerId: user.id },
					}),
					db.booking.count({
						where: { providerId: user.id, status: "COMPLETED" },
					}),
					db.review.aggregate({
						where: { targetId: user.id },
						_avg: { rating: true },
					}),
					db.booking.findMany({
						where: { providerId: user.id },
						select: { studentId: true },
						distinct: ["studentId"],
					}).then(bookings => bookings.length),
				]);

				return c.json({
					data: {
						earnings: {
							totalLifetime: Number(totalEarnings._sum.amount || 0),
							availableBalance: Number(availableEarnings._sum.amount || 0),
							pendingClearance: Number(pendingEarnings._sum.amount || 0),
							thisMonth: Number(thisMonthEarnings._sum.amount || 0),
							lastMonth: Number(lastMonthEarnings._sum.amount || 0),
							currency: "NGN",
						},
						payouts: {
							totalPaidOut: Number(totalPayouts._sum.amount || 0),
							pendingPayouts: Number(pendingPayouts._sum.amount || 0),
							lastPayoutDate: lastPayout?.processedAt?.toISOString() || null,
						},
						performance: {
							totalBookings,
							completedBookings,
							averageRating: Number(averageRating._avg.rating || 0),
							totalStudents,
						},
					},
				});
			} catch (error) {
				console.error("Error fetching provider dashboard summary:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		}
	)

	// GET /api/provider/earnings - Get paginated earnings history
	.get(
		"/earnings",
		validator("query", earningsQuerySchema),
		describeRoute({
			tags: ["Provider Earnings"],
			summary: "Get provider earnings history",
			description: "Get paginated list of provider earnings with filtering options",
			responses: {
				200: {
					description: "Paginated earnings list",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									data: {
										type: "array",
										items: {
											type: "object",
											properties: {
												id: { type: "string" },
												amount: { type: "number" },
												platformFee: { type: "number" },
												grossAmount: { type: "number" },
												currency: { type: "string" },
												status: { type: "string" },
												clearedAt: { type: "string" },
												createdAt: { type: "string" },
												booking: {
													type: "object",
													properties: {
														id: { type: "string" },
														service: {
															type: "object",
															properties: {
																name: { type: "string" },
																category: { type: "object" },
															},
														},
														student: {
															type: "object",
															properties: {
																name: { type: "string" },
															},
														},
													},
												},
											},
										},
									},
									meta: {
										type: "object",
										properties: {
											pagination: {
												type: "object",
												properties: {
													page: { type: "number" },
													limit: { type: "number" },
													total: { type: "number" },
													totalPages: { type: "number" },
													hasNextPage: { type: "boolean" },
													hasPrevPage: { type: "boolean" },
												},
											},
										},
									},
								},
							},
						},
					},
				},
				403: {
					description: "Unauthorized - Only providers can access earnings",
				},
			},
		}),
		async (c) => {
			const user = c.get("user");
			const { page = 1, limit = 20, status, startDate, endDate, cursor } = c.req.valid("query");

			if (user.userType !== "PROVIDER") {
				return c.json({ error: "Unauthorized - Only providers can access earnings" }, 403);
			}

			try {
				const dateFilter = {
					...(startDate && { gte: new Date(startDate) }),
					...(endDate && { lte: new Date(endDate) }),
				};

				const where = {
					providerId: user.id,
					...(status && { status }),
					...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
				};

				// Use cursor-based pagination for better performance
				const earnings = await db.earning.findMany({
					where,
					...(cursor && {
						cursor: { id: cursor },
						skip: 1,
					}),
					take: limit,
					orderBy: { createdAt: "desc" },
					include: {
						booking: {
							select: {
								id: true,
								service: {
									select: {
										name: true,
										category: {
											select: {
												name: true,
											},
										},
									},
								},
								student: {
									select: {
										name: true,
									},
								},
							},
						},
					},
				});

				// Get total count for pagination
				const total = await db.earning.count({ where });

				const totalPages = Math.ceil(total / limit);
				const hasNextPage = earnings.length === limit;
				const hasPrevPage = page > 1;

				return c.json({
					data: earnings.map(earning => ({
						id: earning.id,
						amount: Number(earning.amount),
						platformFee: Number(earning.platformFee || 0),
						grossAmount: Number(earning.grossAmount),
						currency: earning.currency,
						status: earning.status,
						clearedAt: earning.clearedAt?.toISOString() || null,
						createdAt: earning.createdAt.toISOString(),
						booking: {
							id: earning.booking.id,
							service: {
								name: earning.booking.service.name,
								category: earning.booking.service.category,
							},
							student: {
								name: earning.booking.student.name,
							},
						},
					})),
					meta: {
						pagination: {
							page,
							limit,
							total,
							totalPages,
							hasNextPage,
							hasPrevPage,
							nextCursor: hasNextPage ? earnings[earnings.length - 1]?.id : null,
						},
					},
				});
			} catch (error) {
				console.error("Error fetching provider earnings:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		}
	)

	// GET /api/provider/analytics - Get analytics data for charts
	.get(
		"/analytics",
		validator("query", analyticsQuerySchema),
		describeRoute({
			tags: ["Provider Earnings"],
			summary: "Get provider analytics data",
			description: "Get analytics data for charts and performance visualization",
			responses: {
				200: {
					description: "Analytics data based on report type",
				},
				403: {
					description: "Unauthorized - Only providers can access analytics",
				},
			},
		}),
		async (c) => {
			const user = c.get("user");
			const { report, startDate, endDate, period } = c.req.valid("query");

			if (user.userType !== "PROVIDER") {
				return c.json({ error: "Unauthorized - Only providers can access analytics" }, 403);
			}

			try {
				const dateFilter = {
					...(startDate && { gte: new Date(startDate) }),
					...(endDate && { lte: new Date(endDate) }),
				};

				let analyticsData: any[] = [];

				switch (report) {
					case "earnings_by_service":
						analyticsData = await db.earning.groupBy({
							by: ["bookingId"],
							where: {
								providerId: user.id,
								...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
							},
							_sum: { amount: true },
							_count: { id: true },
						});

						// Get service details for each earning
						const serviceEarnings = await Promise.all(
							analyticsData.map(async (earning) => {
								const booking = await db.booking.findUnique({
									where: { id: earning.bookingId },
									include: {
										service: {
											select: { name: true, category: { select: { name: true } } },
										},
									},
								});
								return {
									serviceName: booking?.service.name || "Unknown",
									categoryName: booking?.service.category.name || "Unknown",
									totalEarnings: Number(earning._sum.amount || 0),
									bookingCount: earning._count.id,
								};
							})
						);

						// Group by service name
						const groupedByService = serviceEarnings.reduce((acc, item) => {
							const existing = acc.find(x => x.serviceName === item.serviceName);
							if (existing) {
								existing.totalEarnings += item.totalEarnings;
								existing.bookingCount += item.bookingCount;
							} else {
								acc.push(item);
							}
							return acc;
						}, [] as any[]);

						analyticsData = groupedByService.sort((a, b) => b.totalEarnings - a.totalEarnings);
						break;

					case "earnings_over_time":
					case "bookings_over_time":
						// Time-based aggregation
						const timeField = report === "earnings_over_time" ? "amount" : "id";
						const aggregationType = report === "earnings_over_time" ? "_sum" : "_count";

						const timeBasedData = await db.earning.groupBy({
							by: ["createdAt"],
							where: {
								providerId: user.id,
								...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
							},
							[aggregationType]: { [timeField]: true },
							orderBy: { createdAt: "asc" },
						});

						// Format data by period
						analyticsData = timeBasedData.map(item => ({
							date: item.createdAt.toISOString().split('T')[0],
							value: report === "earnings_over_time" 
								? Number((item as any)._sum.amount || 0)
								: (item as any)._count.id,
						}));
						break;
				}

				return c.json({
					data: analyticsData,
					meta: {
						report,
						period,
						dateRange: { startDate, endDate },
					},
				});
			} catch (error) {
				console.error("Error fetching provider analytics:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		}
	)

	// GET /api/provider/payout-requests - Get payout requests history
	.get(
		"/payout-requests",
		describeRoute({
			tags: ["Provider Earnings"],
			summary: "Get payout requests history",
			description: "Get list of payout requests with status filtering",
			responses: {
				200: {
					description: "List of payout requests",
				},
				403: {
					description: "Unauthorized - Only providers can access payout requests",
				},
			},
		}),
		async (c) => {
			const user = c.get("user");
			const status = c.req.query("status");
			const limit = Math.min(parseInt(c.req.query("limit") || "20"), 100);

			if (user.userType !== "PROVIDER") {
				return c.json({ error: "Unauthorized - Only providers can access payout requests" }, 403);
			}

			try {
				const where = {
					providerId: user.id,
					...(status && { status }),
				};

				const payouts = await db.payout.findMany({
					where,
					take: limit,
					orderBy: { createdAt: "desc" },
				});

				return c.json({
					requests: payouts.map(payout => ({
						id: payout.id,
						amount: Number(payout.amount),
						currency: payout.currency,
						status: payout.status,
						paymentProvider: payout.paymentProvider,
						accountDetails: {
							accountNumber: payout.accountNumber,
							accountName: payout.accountName,
							bankName: payout.bankName,
						},
						createdAt: payout.createdAt.toISOString(),
						processedAt: payout.processedAt?.toISOString() || null,
						rejectionReason: payout.rejectionReason || null,
					})),
				});
			} catch (error) {
				console.error("Error fetching payout requests:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		}
	)

	// POST /api/provider/payouts - Request a payout
	.post(
		"/payouts",
		validator("json", payoutRequestSchema),
		describeRoute({
			tags: ["Provider Earnings"],
			summary: "Request a payout",
			description: "Create a payout request for available earnings",
			responses: {
				201: {
					description: "Payout request created successfully",
				},
				400: {
					description: "Invalid payout request",
				},
				403: {
					description: "Unauthorized - Only providers can request payouts",
				},
			},
		}),
		async (c) => {
			const user = c.get("user");
			const payoutData = c.req.valid("json");

			if (user.userType !== "PROVIDER") {
				return c.json({ error: "Unauthorized - Only providers can request payouts" }, 403);
			}

			try {
				// Check available balance
				const availableEarnings = await db.earning.aggregate({
					where: {
						providerId: user.id,
						status: "AVAILABLE",
					},
					_sum: { amount: true },
				});

				const availableBalance = Number(availableEarnings._sum.amount || 0);

				if (payoutData.amount > availableBalance) {
					return c.json({
						error: "Insufficient balance",
						details: {
							requested: payoutData.amount,
							available: availableBalance,
						},
					}, 400);
				}

				// Create payout request
				const payout = await db.payout.create({
					data: {
						providerId: user.id,
						amount: payoutData.amount,
						currency: "NGN",
						paymentProvider: payoutData.paymentProvider,
						accountNumber: payoutData.accountNumber,
						accountName: payoutData.accountName,
						bankCode: payoutData.bankCode,
						bankName: payoutData.bankName,
					},
				});

				// Update relevant earnings to PAID_OUT status (this would typically be done after processing)
				// For now, we'll leave them as AVAILABLE until the payout is actually processed

				return c.json({
					data: {
						id: payout.id,
						amount: Number(payout.amount),
						status: payout.status,
						createdAt: payout.createdAt.toISOString(),
					},
					message: "Payout request created successfully",
				}, 201);
			} catch (error) {
				console.error("Error creating payout request:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		}
	);
