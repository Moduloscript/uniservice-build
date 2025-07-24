import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { describeRoute } from "hono-openapi";

export const debugUserRouter = new Hono()
	.use(authMiddleware)

	// GET /api/debug/user - Get current user information for debugging
	.get(
		"/user",
		describeRoute({
			tags: ["Debug"],
			summary: "Get current user information",
			description: "Get current user information for debugging purposes",
			responses: {
				200: {
					description: "Current user information",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									user: {
										type: "object",
										properties: {
											id: { type: "string" },
											name: { type: "string" },
											email: { type: "string" },
											userType: { type: "string" },
											onboardingComplete: {
												type: "boolean",
											},
											verificationStatus: {
												type: "string",
											},
										},
									},
									debugInfo: {
										type: "object",
										properties: {
											isProvider: { type: "boolean" },
											needsOnboarding: {
												type: "boolean",
											},
											canAccessProviderDashboard: {
												type: "boolean",
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

			const debugInfo = {
				isProvider: user.userType === "PROVIDER",
				needsOnboarding: !user.onboardingComplete,
				canAccessProviderDashboard:
					user.userType === "PROVIDER" && user.onboardingComplete,
			};

			return c.json({
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					userType: user.userType,
					onboardingComplete: user.onboardingComplete,
					verificationStatus: user.verificationStatus,
				},
				debugInfo,
			});
		},
	)

	// GET /api/debug/refresh-session - Force refresh session from database
	.get(
		"/refresh-session",
		describeRoute({
			tags: ["Debug"],
			summary: "Force refresh session from database",
			description:
				"Force refresh the current session to pull latest user data from database",
			responses: {
				200: {
					description: "Session refreshed successfully",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									message: { type: "string" },
									user: {
										type: "object",
										properties: {
											id: { type: "string" },
											userType: { type: "string" },
											verificationStatus: {
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
		}),
		async (c) => {
			const user = c.get("user");

			// Force fetch fresh user data from database
			const { db } = await import("@repo/database");
			const freshUser = await db.user.findUnique({
				where: { id: user.id },
				select: {
					id: true,
					name: true,
					email: true,
					userType: true,
					onboardingComplete: true,
					verificationStatus: true,
					isVerified: true,
				},
			});

			if (!freshUser) {
				return c.json({ error: "User not found" }, 404);
			}

			return c.json({
				message: "Fresh user data from database",
				user: freshUser,
			});
		},
	);
