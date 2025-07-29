import { Hono } from "hono";
import { z } from "zod";
import { db } from "@repo/database";
import { validator } from "hono-openapi/zod";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../../middleware/auth";

// Message creation schema
const createMessageSchema = z.object({
	content: z.string().min(1, "Message content cannot be empty").max(2000, "Message too long"),
	type: z.enum(["TEXT", "SYSTEM", "ATTACHMENT"]).optional().default("TEXT"),
	metadata: z.record(z.any()).optional(),
});

// Message query schema
const messagesQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.transform((val) => (val ? Number.parseInt(val) : 1)),
	limit: z
		.string()
		.optional()
		.transform((val) => (val ? Number.parseInt(val) : 50)),
	cursor: z.string().optional(), // For cursor-based pagination
});

export const messagesRouter = new Hono()
	.basePath("/messages")
	.use(authMiddleware)

	// POST /api/messages/bookings/:bookingId - Send a message in a booking chat
	.post(
		"/bookings/:bookingId",
		validator("json", createMessageSchema),
		describeRoute({
			tags: ["Messages"],
			summary: "Send a message in booking chat",
			description: "Send a message in a specific booking's chat thread",
			responses: {
				201: {
					description: "Message sent successfully",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									message: {
										type: "object",
										properties: {
											id: { type: "string" },
											content: { type: "string" },
											type: { type: "string" },
											senderId: { type: "string" },
											bookingId: { type: "string" },
											createdAt: { type: "string" },
											sender: {
												type: "object",
												properties: {
													id: { type: "string" },
													name: { type: "string" },
													userType: { type: "string" },
												},
											},
										},
									},
								},
							},
						},
					},
				},
				400: { description: "Invalid request data" },
				403: { description: "Unauthorized to send messages in this booking" },
				404: { description: "Booking not found" },
			},
		}),
		async (c) => {
			const user = c.get("user");
			const bookingId = c.req.param("bookingId");
			const { content, type, metadata } = c.req.valid("json");

			try {
				// Verify booking exists and user is participant
				const booking = await db.booking.findUnique({
					where: { id: bookingId },
					select: {
						id: true,
						studentId: true,
						providerId: true,
						status: true,
					},
				});

				if (!booking) {
					return c.json({ error: "Booking not found" }, 404);
				}

				// Check if user is participant in this booking
				if (booking.studentId !== user.id && booking.providerId !== user.id) {
					return c.json(
						{ error: "Unauthorized to send messages in this booking" },
						403,
					);
				}

				// Create the message
				const message = await db.message.create({
					data: {
						bookingId,
						senderId: user.id,
						content,
						type,
						metadata,
					},
					include: {
						sender: {
							select: {
								id: true,
								name: true,
								userType: true,
							},
						},
					},
				});

				return c.json({ message }, 201);
			} catch (error) {
				console.error("Error sending message:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

	// GET /api/messages/bookings/:bookingId - Get messages for a booking
	.get(
		"/bookings/:bookingId",
		validator("query", messagesQuerySchema),
		describeRoute({
			tags: ["Messages"],
			summary: "Get messages for booking",
			description: "Retrieve paginated messages for a specific booking",
			responses: {
				200: {
					description: "Messages retrieved successfully",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									messages: {
										type: "array",
										items: {
											type: "object",
											properties: {
												id: { type: "string" },
												content: { type: "string" },
												type: { type: "string" },
												senderId: { type: "string" },
												createdAt: { type: "string" },
												sender: {
													type: "object",
													properties: {
														id: { type: "string" },
														name: { type: "string" },
														userType: { type: "string" },
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
											hasNext: { type: "boolean" },
											hasPrev: { type: "boolean" },
											nextCursor: { type: "string" },
										},
									},
								},
							},
						},
					},
				},
				403: { description: "Unauthorized to view messages in this booking" },
				404: { description: "Booking not found" },
			},
		}),
		async (c) => {
			const user = c.get("user");
			const bookingId = c.req.param("bookingId");
			const { page, limit, cursor } = c.req.valid("query");

			try {
				// Verify booking exists and user is participant
				const booking = await db.booking.findUnique({
					where: { id: bookingId },
					select: {
						id: true,
						studentId: true,
						providerId: true,
					},
				});

				if (!booking) {
					return c.json({ error: "Booking not found" }, 404);
				}

				// Check if user is participant in this booking
				if (booking.studentId !== user.id && booking.providerId !== user.id) {
					return c.json(
						{ error: "Unauthorized to view messages in this booking" },
						403,
					);
				}

				// Build where clause for cursor-based pagination
				const whereClause: any = {
					bookingId,
				};

				if (cursor) {
					whereClause.createdAt = {
						lt: new Date(cursor),
					};
				}

				// Get messages with pagination
				const messages = await db.message.findMany({
					where: whereClause,
					include: {
						sender: {
							select: {
								id: true,
								name: true,
								userType: true,
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
					take: limit + 1, // Get one extra to check if there are more
				});

				const hasNext = messages.length > limit;
				const finalMessages = hasNext ? messages.slice(0, limit) : messages;

				// Get total count for pagination info
				const totalCount = await db.message.count({
					where: { bookingId },
				});

				const nextCursor = hasNext 
					? finalMessages[finalMessages.length - 1]?.createdAt.toISOString()
					: null;

				return c.json({
					messages: finalMessages,
					pagination: {
						page,
						limit,
						total: totalCount,
						hasNext,
						hasPrev: cursor !== undefined,
						nextCursor,
					},
				});
			} catch (error) {
				console.error("Error fetching messages:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

	// PATCH /api/messages/:messageId - Update message (for editing)
	.patch(
		"/:messageId",
		validator("json", z.object({
			content: z.string().min(1).max(2000),
		})),
		describeRoute({
			tags: ["Messages"],
			summary: "Update a message",
			description: "Edit a message (only by the sender within a time limit)",
			responses: {
				200: { description: "Message updated successfully" },
				403: { description: "Unauthorized to edit this message" },
				404: { description: "Message not found" },
			},
		}),
		async (c) => {
			const user = c.get("user");
			const messageId = c.req.param("messageId");
			const { content } = c.req.valid("json");

			try {
				// Find the message and verify ownership
				const message = await db.message.findUnique({
					where: { id: messageId },
					select: {
						id: true,
						senderId: true,
						createdAt: true,
					},
				});

				if (!message) {
					return c.json({ error: "Message not found" }, 404);
				}

				// Check if user is the sender
				if (message.senderId !== user.id) {
					return c.json(
						{ error: "Unauthorized to edit this message" },
						403,
					);
				}

				// Check if message is too old to edit (15 minutes limit)
				const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
				if (message.createdAt < fifteenMinutesAgo) {
					return c.json(
						{ error: "Message too old to edit" },
						403,
					);
				}

				// Update the message
				const updatedMessage = await db.message.update({
					where: { id: messageId },
					data: {
						content,
						updatedAt: new Date(),
					},
					include: {
						sender: {
							select: {
								id: true,
								name: true,
								userType: true,
							},
						},
					},
				});

				return c.json({ message: updatedMessage });
			} catch (error) {
				console.error("Error updating message:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

	// DELETE /api/messages/:messageId - Delete message
	.delete(
		"/:messageId",
		describeRoute({
			tags: ["Messages"],
			summary: "Delete a message",
			description: "Delete a message (only by the sender within a time limit)",
			responses: {
				200: { description: "Message deleted successfully" },
				403: { description: "Unauthorized to delete this message" },
				404: { description: "Message not found" },
			},
		}),
		async (c) => {
			const user = c.get("user");
			const messageId = c.req.param("messageId");

			try {
				// Find the message and verify ownership
				const message = await db.message.findUnique({
					where: { id: messageId },
					select: {
						id: true,
						senderId: true,
						createdAt: true,
					},
				});

				if (!message) {
					return c.json({ error: "Message not found" }, 404);
				}

				// Check if user is the sender
				if (message.senderId !== user.id) {
					return c.json(
						{ error: "Unauthorized to delete this message" },
						403,
					);
				}

				// Check if message is too old to delete (15 minutes limit)
				const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
				if (message.createdAt < fifteenMinutesAgo) {
					return c.json(
						{ error: "Message too old to delete" },
						403,
					);
				}

				// Delete the message
				await db.message.delete({
					where: { id: messageId },
				});

				return c.json({ message: "Message deleted successfully" });
			} catch (error) {
				console.error("Error deleting message:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	);
