import { Hono } from "hono";
import { z } from "zod";
import { db } from "@repo/database";
import { validator } from "hono-openapi/zod";
import { authMiddleware } from "../middleware/auth";
import { ServiceOutcomesSchema } from "@repo/database/zod";

// Create service outcome schema
const createServiceOutcomeSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string().optional(),
	icon: z.string().default("target"),
	orderIndex: z.number().int().min(0).default(0),
	isActive: z.boolean().default(true),
});

// Update service outcome schema
const updateServiceOutcomeSchema = createServiceOutcomeSchema.partial();

// Service ID parameter schema
const serviceIdSchema = z.object({
	serviceId: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, "Invalid service ID format"),
});

// Outcome ID parameter schema
const outcomeIdSchema = z.object({
	outcomeId: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, "Invalid outcome ID format"),
});

export const serviceOutcomesRouter = new Hono()
	// Get all outcomes for a service
	.get("/:serviceId/outcomes", validator("param", serviceIdSchema), async (c) => {
		const { serviceId } = c.req.valid("param");
		
		// Verify service exists
		const service = await db.service.findUnique({
			where: { id: serviceId },
			select: { id: true }
		});
		
		if (!service) {
			return c.json({ error: "Service not found" }, 404);
		}
		
		// Get all outcomes for the service, ordered by orderIndex
		const outcomes = await db.serviceOutcomes.findMany({
			where: { 
				serviceId,
				isActive: true
			},
			orderBy: { orderIndex: "asc" }
		});
		
		return c.json({ outcomes });
	})
	
	// Create a new outcome for a service
	.post("/:serviceId/outcomes", 
		authMiddleware, 
		validator("param", serviceIdSchema),
		validator("json", createServiceOutcomeSchema), 
		async (c) => {
			const user = c.get("user");
			const { serviceId } = c.req.valid("param");
			const data = c.req.valid("json");
			
			// Verify service exists and user owns it
			const service = await db.service.findUnique({
				where: { id: serviceId },
				select: { id: true, providerId: true }
			});
			
			if (!service) {
				return c.json({ error: "Service not found" }, 404);
			}
			
			if (service.providerId !== user.id) {
				return c.json({ error: "Unauthorized - You can only manage outcomes for your own services" }, 403);
			}
			
			// Generate a unique ID for the outcome
			const outcomeId = `so_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
			
			// Create the outcome
			const outcome = await db.serviceOutcomes.create({
				data: {
					id: outcomeId,
					serviceId,
					title: data.title,
					description: data.description || null,
					icon: data.icon || "target",
					orderIndex: data.orderIndex || 0,
					isActive: data.isActive ?? true,
				}
			});
			
			return c.json({ outcome }, 201);
		}
	)
	
	// Update an outcome
	.put("/:serviceId/outcomes/:outcomeId", 
		authMiddleware,
		validator("param", serviceIdSchema.merge(outcomeIdSchema)),
		validator("json", updateServiceOutcomeSchema),
		async (c) => {
			const user = c.get("user");
			const { serviceId, outcomeId } = c.req.valid("param");
			const data = c.req.valid("json");
			
			// Verify service exists and user owns it
			const service = await db.service.findUnique({
				where: { id: serviceId },
				select: { id: true, providerId: true }
			});
			
			if (!service) {
				return c.json({ error: "Service not found" }, 404);
			}
			
			if (service.providerId !== user.id) {
				return c.json({ error: "Unauthorized - You can only manage outcomes for your own services" }, 403);
			}
			
			// Verify outcome exists and belongs to this service
			const existingOutcome = await db.serviceOutcomes.findFirst({
				where: { 
					id: outcomeId,
					serviceId
				}
			});
			
			if (!existingOutcome) {
				return c.json({ error: "Outcome not found" }, 404);
			}
			
			// Update the outcome
			const updatedOutcome = await db.serviceOutcomes.update({
				where: { id: outcomeId },
				data: {
					...(data.title && { title: data.title }),
					...(data.description !== undefined && { description: data.description }),
					...(data.icon && { icon: data.icon }),
					...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
					...(data.isActive !== undefined && { isActive: data.isActive }),
				}
			});
			
			return c.json({ outcome: updatedOutcome });
		}
	)
	
	// Delete an outcome
	.delete("/:serviceId/outcomes/:outcomeId", 
		authMiddleware,
		validator("param", serviceIdSchema.merge(outcomeIdSchema)),
		async (c) => {
			const user = c.get("user");
			const { serviceId, outcomeId } = c.req.valid("param");
			
			// Verify service exists and user owns it
			const service = await db.service.findUnique({
				where: { id: serviceId },
				select: { id: true, providerId: true }
			});
			
			if (!service) {
				return c.json({ error: "Service not found" }, 404);
			}
			
			if (service.providerId !== user.id) {
				return c.json({ error: "Unauthorized - You can only manage outcomes for your own services" }, 403);
			}
			
			// Verify outcome exists and belongs to this service
			const existingOutcome = await db.serviceOutcomes.findFirst({
				where: { 
					id: outcomeId,
					serviceId
				}
			});
			
			if (!existingOutcome) {
				return c.json({ error: "Outcome not found" }, 404);
			}
			
			// Delete the outcome
			await db.serviceOutcomes.delete({
				where: { id: outcomeId }
			});
			
			return c.json({ success: true });
		}
	)
	
	// Reorder outcomes for a service
	.patch("/:serviceId/outcomes/reorder",
		authMiddleware,
		validator("param", serviceIdSchema),
		validator("json", z.object({
			outcomeIds: z.array(z.string()).min(1)
		})),
		async (c) => {
			const user = c.get("user");
			const { serviceId } = c.req.valid("param");
			const { outcomeIds } = c.req.valid("json");
			
			// Verify service exists and user owns it
			const service = await db.service.findUnique({
				where: { id: serviceId },
				select: { id: true, providerId: true }
			});
			
			if (!service) {
				return c.json({ error: "Service not found" }, 404);
			}
			
			if (service.providerId !== user.id) {
				return c.json({ error: "Unauthorized - You can only manage outcomes for your own services" }, 403);
			}
			
			// Verify all outcomes exist and belong to this service
			const existingOutcomes = await db.serviceOutcomes.findMany({
				where: { 
					serviceId,
					id: { in: outcomeIds }
				},
				select: { id: true }
			});
			
			if (existingOutcomes.length !== outcomeIds.length) {
				return c.json({ error: "One or more outcomes not found" }, 404);
			}
			
			// Update order indices
			const updatePromises = outcomeIds.map((outcomeId, index) => 
				db.serviceOutcomes.update({
					where: { id: outcomeId },
					data: { orderIndex: index }
				})
			);
			
			await Promise.all(updatePromises);
			
			// Return updated outcomes
			const updatedOutcomes = await db.serviceOutcomes.findMany({
				where: { 
					serviceId,
					isActive: true
				},
				orderBy: { orderIndex: "asc" }
			});
			
			return c.json({ outcomes: updatedOutcomes });
		}
	);
