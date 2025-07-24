import { Hono } from "hono";
import { z } from "zod";
import { db } from "@repo/database";
import { validator } from "hono-openapi/zod";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../../middleware/auth";

// Query parameters schema
const servicesQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.transform((val) => (val ? Number.parseInt(val) : 1)),
	limit: z
		.string()
		.optional()
		.transform((val) => (val ? Number.parseInt(val) : 10)),
	status: z.enum(["active", "inactive", "all"]).optional().default("all"),
	sortBy: z
		.enum(["name", "price", "createdAt", "updatedAt"])
		.optional()
		.default("updatedAt"),
	sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
	search: z.string().optional(),
});

export const providerServicesRouter = new Hono()
	.basePath("/provider/services")
	.use(authMiddleware)

	// GET /api/provider/services - Get all services for authenticated provider
	.get(
		"/",
		validator("query", servicesQuerySchema),
		describeRoute({
			tags: ["Provider Services"],
			summary: "Get provider services",
			description:
				"Get all services for authenticated provider with pagination, filtering, and sorting",
			responses: {
				200: {
					description: "Provider services list",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									services: {
										type: "array",
										items: {
											type: "object",
											properties: {
												id: { type: "string" },
												name: { type: "string" },
												description: { type: "string" },
												price: { type: "number" },
												duration: { type: "number" },
												isActive: { type: "boolean" },
												createdAt: { type: "string" },
												updatedAt: { type: "string" },
												category: {
													type: "object",
													properties: {
														id: { type: "string" },
														name: {
															type: "string",
														},
														description: {
															type: "string",
														},
													},
												},
												_count: {
													type: "object",
													properties: {
														bookings: {
															type: "number",
														},
														features: {
															type: "number",
														},
													},
												},
											},
										},
									},
									pagination: {
										type: "object",
										properties: {
											page: { type: "number" },
											limit: { type: "number" },
											total: { type: "number" },
											totalPages: { type: "number" },
											hasNext: { type: "boolean" },
											hasPrev: { type: "boolean" },
										},
									},
								},
							},
						},
					},
				},
				403: {
					description:
						"Unauthorized - Only providers can access their services",
				},
			},
		}),
		async (c) => {
			const user = c.get("user");
			const { page, limit, status, sortBy, sortOrder, search } =
				c.req.valid("query");

			// Verify user is a provider
			if (user.userType !== "PROVIDER") {
				return c.json(
					{
						error: "Unauthorized - Only providers can access their services",
					},
					403,
				);
			}

			try {
				// Build where clause
				const whereClause: any = {
					providerId: user.id,
				};

				// Add status filter
				if (status !== "all") {
					whereClause.isActive = status === "active";
				}

				// Add search filter
				if (search) {
					whereClause.OR = [
						{ name: { contains: search, mode: "insensitive" } },
						{
							description: {
								contains: search,
								mode: "insensitive",
							},
						},
					];
				}

				// Build order by clause
				const orderBy: any = {};
				orderBy[sortBy] = sortOrder;

				// Calculate pagination
				const skip = (page - 1) * limit;

				// Get total count
				const totalCount = await db.service.count({
					where: whereClause,
				});

				// Get services with related data
				const services = await db.service.findMany({
					where: whereClause,
					include: {
						category: {
							select: {
								id: true,
								name: true,
								description: true,
							},
						},
						_count: {
							select: {
								bookings: true,
								features: true,
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
					services,
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
				console.error("Error fetching provider services:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

	// GET /api/provider/services/summary - Get services summary for dashboard
	.get(
		"/summary",
		describeRoute({
			tags: ["Provider Services"],
			summary: "Get provider services summary",
			description:
				"Get summary statistics for provider services including counts by status and recent activity",
			responses: {
				200: {
					description: "Provider services summary",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									total: { type: "number" },
									active: { type: "number" },
									inactive: { type: "number" },
									recentServices: {
										type: "array",
										items: {
											type: "object",
											properties: {
												id: { type: "string" },
												name: { type: "string" },
												price: { type: "number" },
												isActive: { type: "boolean" },
												createdAt: { type: "string" },
												category: {
													type: "object",
													properties: {
														name: {
															type: "string",
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		}),
		async (c) => {
			const user = c.get("user");

			// Verify user is a provider
			if (user.userType !== "PROVIDER") {
				return c.json(
					{
						error: "Unauthorized - Only providers can access their services",
					},
					403,
				);
			}

			try {
				// Get service counts by status
				const serviceStats = await db.service.groupBy({
					by: ["isActive"],
					where: {
						providerId: user.id,
					},
					_count: {
						id: true,
					},
				});

				const total = serviceStats.reduce(
					(sum, stat) => sum + stat._count.id,
					0,
				);
				const active =
					serviceStats.find((stat) => stat.isActive)?._count.id || 0;
				const inactive =
					serviceStats.find((stat) => !stat.isActive)?._count.id || 0;

				// Get recent services (last 5)
				const recentServices = await db.service.findMany({
					where: {
						providerId: user.id,
					},
					include: {
						category: {
							select: {
								name: true,
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
					take: 5,
				});

				return c.json({
					total,
					active,
					inactive,
					recentServices,
				});
			} catch (error) {
				console.error(
					"Error fetching provider services summary:",
					error,
				);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	);
