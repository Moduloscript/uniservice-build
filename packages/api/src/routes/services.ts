import { Hono } from "hono";
import { z } from "zod";
import { db } from "@repo/database";
import { validator } from "hono-openapi/zod";
import { authMiddleware } from "../middleware/auth";

// Service creation schema (categoryId is required)
const createServiceSchema = z.object({
	name: z.string().min(2),
	description: z.string().min(5),
	price: z.number().positive(),
	duration: z.number().int().positive(),
	categoryId: z.string().cuid(),
});

export const servicesRouter = new Hono()
	.use(authMiddleware)
	// Create a new service
	.post("/", validator("json", createServiceSchema), async (c) => {
		const user = c.get("user");
		const data = c.req.valid("json");

		// Validate categoryId exists
		const category = await db.serviceCategory.findUnique({
			where: { id: data.categoryId },
		});
		if (!category) {
			return c.json({ error: "Invalid categoryId" }, 400);
		}

		const service = await db.service.create({
			data: {
				name: data.name,
				description: data.description,
				price: data.price,
				duration: data.duration,
				categoryId: data.categoryId,
				providerId: user.id,
			},
		});
		return c.json({ service });
	})
	// List all services (optionally filter by categoryId)
	.get("/", async (c) => {
		const categoryId = c.req.query("categoryId");
		const where = categoryId ? { categoryId } : {};
		const services = await db.service.findMany({
			where,
			include: { category: true },
		});
		return c.json({ services });
	})
	// Get a service by ID
	.get(":id", async (c) => {
		const id = c.req.param("id");
		if (!z.string().cuid().safeParse(id).success) {
			return c.json({ error: "Invalid service ID" }, 400);
		}
		const service = await db.service.findUnique({
			where: { id },
			include: { category: true, provider: true },
		});
		if (!service) {
			return c.json({ error: "Service not found" }, 404);
		}
		return c.json({ service });
	})
	// Update a service by ID
	.put(":id", validator("json", createServiceSchema.partial()), async (c) => {
		const id = c.req.param("id");
		if (!z.string().cuid().safeParse(id).success) {
			return c.json({ error: "Invalid service ID" }, 400);
		}
		const user = c.get("user");
		const data = c.req.valid("json");
		const service = await db.service.findUnique({ where: { id } });
		if (!service) {
			return c.json({ error: "Service not found" }, 404);
		}
		if (service.providerId !== user.id) {
			return c.json({ error: "Unauthorized" }, 403);
		}
		if (data.categoryId) {
			const category = await db.serviceCategory.findUnique({
				where: { id: data.categoryId },
			});
			if (!category) {
				return c.json({ error: "Invalid categoryId" }, 400);
			}
		}
		const updated = await db.service.update({
			where: { id },
			data: {
				...data,
			},
			include: { category: true, provider: true },
		});
		return c.json({ service: updated });
	})
	// Delete a service by ID
	.delete(":id", async (c) => {
		const id = c.req.param("id");
		if (!z.string().cuid().safeParse(id).success) {
			return c.json({ error: "Invalid service ID" }, 400);
		}
		const user = c.get("user");
		const service = await db.service.findUnique({ where: { id } });
		if (!service) {
			return c.json({ error: "Service not found" }, 404);
		}
		if (service.providerId !== user.id) {
			return c.json({ error: "Unauthorized" }, 403);
		}
		await db.service.delete({ where: { id } });
		return c.json({ success: true });
	});
