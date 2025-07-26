import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { flutterwaveWebhookRouter } from "./flutterwave-webhook";
import { paymentInitializeRouter } from "./initialize";

export const paymentsRouter = new Hono()
	.basePath("/payments")
	.get("/health", async (c) => {
		// Health check endpoint for payment services
		return c.json({ 
			status: "Payment API active", 
			providers: ["flutterwave", "paystack"],
			timestamp: new Date().toISOString()
		});
	})
	.route("/webhooks", flutterwaveWebhookRouter)
	.route("/", paymentInitializeRouter);
