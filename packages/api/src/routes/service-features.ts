import { Hono } from "hono";
import { z } from "zod";
import { db } from "@repo/database";
import { validator } from "hono-openapi/zod";
import { authMiddleware } from "../middleware/auth";
import { ServiceFeaturesSchema } from "@repo/database/zod";

// Create service feature schema
const createServiceFeatureSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string().optional(),
	icon: z.string().default("check-circle"),
	orderIndex: z.number().int().min(0).default(0),
	isActive: z.boolean().default(true),
});

// Update service feature schema
const updateServiceFeatureSchema = createServiceFeatureSchema.partial();

// Service ID parameter schema
const serviceIdSchema = z.object({
	serviceId: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, "Invalid service ID format"),
});

// Feature ID parameter schema
const featureIdSchema = z.object({
	featureId: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, "Invalid feature ID format"),
});

export const serviceFeaturesRouter = new Hono()
	// Get all features for a service
	.get("/:serviceId/features", validator("param", serviceIdSchema), async (c) => {
		const { serviceId } = c.req.valid("param");
		
		// Verify service exists
		const service = await db.service.findUnique({
			where: { id: serviceId },
			select: { id: true }
		});
		
		if (!service) {
			return c.json({ error: "Service not found" }, 404);
		}
		
		// Get all features for the service, ordered by orderIndex
		const features = await db.serviceFeatures.findMany({
			where: { 
				serviceId,
				isActive: true
			},
			orderBy: { orderIndex: "asc" }
		});
		
		return c.json({ features });
	})
	
	// Create a new feature for a service
	.post("/:serviceId/features", 
		authMiddleware, 
		validator("param", serviceIdSchema),
		validator("json", createServiceFeatureSchema), 
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
				return c.json({ error: "Unauthorized - You can only manage features for your own services" }, 403);
			}
			
			// Generate a unique ID for the feature
			const featureId = `sf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
			
			// Create the feature
			const feature = await db.serviceFeatures.create({
				data: {
					id: featureId,
					serviceId,
					title: data.title,
					description: data.description || null,
					icon: data.icon || "check-circle",
					orderIndex: data.orderIndex || 0,
					isActive: data.isActive ?? true,
				}
			});
			
			return c.json({ feature }, 201);
		}
	)
	
	// Update a feature
	.put("/:serviceId/features/:featureId", 
		authMiddleware,
		validator("param", serviceIdSchema.merge(featureIdSchema)),
		validator("json", updateServiceFeatureSchema),
		async (c) => {
			const user = c.get("user");
			const { serviceId, featureId } = c.req.valid("param");
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
				return c.json({ error: "Unauthorized - You can only manage features for your own services" }, 403);
			}
			
			// Verify feature exists and belongs to this service
			const existingFeature = await db.serviceFeatures.findFirst({
				where: { 
					id: featureId,
					serviceId
				}
			});
			
			if (!existingFeature) {
				return c.json({ error: "Feature not found" }, 404);
			}
			
			// Update the feature
			const updatedFeature = await db.serviceFeatures.update({
				where: { id: featureId },
				data: {
					...(data.title && { title: data.title }),
					...(data.description !== undefined && { description: data.description }),
					...(data.icon && { icon: data.icon }),
					...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
					...(data.isActive !== undefined && { isActive: data.isActive }),
				}
			});
			
			return c.json({ feature: updatedFeature });
		}
	)
	
	// Delete a feature
	.delete("/:serviceId/features/:featureId", 
		authMiddleware,
		validator("param", serviceIdSchema.merge(featureIdSchema)),
		async (c) => {
			const user = c.get("user");
			const { serviceId, featureId } = c.req.valid("param");
			
			// Verify service exists and user owns it
			const service = await db.service.findUnique({
				where: { id: serviceId },
				select: { id: true, providerId: true }
			});
			
			if (!service) {
				return c.json({ error: "Service not found" }, 404);
			}
			
			if (service.providerId !== user.id) {
				return c.json({ error: "Unauthorized - You can only manage features for your own services" }, 403);
			}
			
			// Verify feature exists and belongs to this service
			const existingFeature = await db.serviceFeatures.findFirst({
				where: { 
					id: featureId,
					serviceId
				}
			});
			
			if (!existingFeature) {
				return c.json({ error: "Feature not found" }, 404);
			}
			
			// Delete the feature
			await db.serviceFeatures.delete({
				where: { id: featureId }
			});
			
			return c.json({ success: true });
		}
	)
	
	// Reorder features for a service
	.patch("/:serviceId/features/reorder",
		authMiddleware,
		validator("param", serviceIdSchema),
		validator("json", z.object({
			featureIds: z.array(z.string()).min(1)
		})),
		async (c) => {
			const user = c.get("user");
			const { serviceId } = c.req.valid("param");
			const { featureIds } = c.req.valid("json");
			
			// Verify service exists and user owns it
			const service = await db.service.findUnique({
				where: { id: serviceId },
				select: { id: true, providerId: true }
			});
			
			if (!service) {
				return c.json({ error: "Service not found" }, 404);
			}
			
			if (service.providerId !== user.id) {
				return c.json({ error: "Unauthorized - You can only manage features for your own services" }, 403);
			}
			
			// Verify all features exist and belong to this service
			const existingFeatures = await db.serviceFeatures.findMany({
				where: { 
					serviceId,
					id: { in: featureIds }
				},
				select: { id: true }
			});
			
			if (existingFeatures.length !== featureIds.length) {
				return c.json({ error: "One or more features not found" }, 404);
			}
			
			// Update order indices
			const updatePromises = featureIds.map((featureId, index) => 
				db.serviceFeatures.update({
					where: { id: featureId },
					data: { orderIndex: index }
				})
			);
			
			await Promise.all(updatePromises);
			
			// Return updated features
			const updatedFeatures = await db.serviceFeatures.findMany({
				where: { 
					serviceId,
					isActive: true
				},
				orderBy: { orderIndex: "asc" }
			});
			
			return c.json({ features: updatedFeatures });
		}
	);
