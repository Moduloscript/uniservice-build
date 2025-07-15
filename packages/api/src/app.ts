import { auth } from "@repo/auth";
import { getBaseUrl } from "@repo/utils";
import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import {} from "openapi-merge";
import {} from "openapi-merge";
import { mergeOpenApiSchemas } from "./lib/openapi-schema";
import { corsMiddleware } from "./middleware/cors";
import { loggerMiddleware } from "./middleware/logger";
import { adminRouter } from "./routes/admin/router";
import { aiRouter } from "./routes/ai";
import { authRouter } from "./routes/auth";
import { contactRouter } from "./routes/contact/router";
import { downloadsRouter } from "./routes/downloads";
import { healthRouter } from "./routes/health";
import { newsletterRouter } from "./routes/newsletter";
import { onboardingRouter } from "./routes/onboarding";
import { organizationsRouter } from "./routes/organizations/router";
import { paymentsRouter } from "./routes/payments/router";
import { uploadsRouter } from "./routes/uploads";
import { webhooksRouter } from "./routes/webhooks";
import { serviceCategoriesRouter } from "./routes/service-categories";
import { servicesRouter } from "./routes/services";
import { serviceFeaturesRouter } from "./routes/service-features";
import { bookingsRouter } from "./routes/bookings";
import { reviewsRouter } from "./routes/reviews";
import { providerDashboardRouter } from "./routes/provider/dashboard";
import { providerServicesRouter } from "./routes/provider/services";
import { providerBookingsRouter } from "./routes/provider/bookings";
import { debugUserRouter } from "./routes/debug-user";
export const app = new Hono().basePath("/api");

app.use(loggerMiddleware);
app.use(corsMiddleware);

const appRouter = app
	.route("/", serviceCategoriesRouter)
	.route("/", authRouter)
	.route("/", webhooksRouter)
	.route("/", aiRouter)
	.route("/", uploadsRouter)
	.route("/", paymentsRouter)
	.route("/", contactRouter)
	.route("/", newsletterRouter)
	.route("/", organizationsRouter)
	.route("/", adminRouter)
	.route("/", healthRouter)
	.route("/", onboardingRouter)
	.route("/", downloadsRouter)
	.route("/", serviceCategoriesRouter)
	.route("/services", servicesRouter)
	.route("/services", serviceFeaturesRouter)
	.route("/bookings", bookingsRouter)
	.route("/reviews", reviewsRouter)
	.route("/", providerDashboardRouter)
	.route("/", providerServicesRouter)
	.route("/", providerBookingsRouter)
	.route("/debug", debugUserRouter);
app.get(
	"/app-openapi",
	openAPISpecs(app, {
		documentation: {
			info: {
				title: "supastarter API",
				version: "1.0.0",
			},
			servers: [
				{
					url: getBaseUrl(),
					description: "API server",
				},
			],
		},
	}),
);

app.get("/openapi", async (c) => {
	const authSchema = await auth.api.generateOpenAPISchema();
	const appSchema = await (
		app.request("/api/app-openapi") as Promise<Response>
	).then((res) => res.json());

	const mergedSchema = mergeOpenApiSchemas({
		appSchema,
		authSchema: authSchema as any,
	});

	return c.json(mergedSchema);
});

app.get(
	"/docs",
	apiReference({
		theme: "saturn",
		spec: {
			url: "/api/openapi",
		},
	}),
);

export type AppRouter = typeof appRouter;
