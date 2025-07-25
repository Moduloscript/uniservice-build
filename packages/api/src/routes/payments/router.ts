import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const paymentsRouter = new Hono()
	.basePath("/payments")
	.get("/health", async (c) => {
		// Placeholder health check endpoint
		return c.json({ status: "Payment API cleared - not implemented" });
	});
