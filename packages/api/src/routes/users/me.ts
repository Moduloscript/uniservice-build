import { Hono } from "hono";
import { z } from "zod";
import { auth } from "@repo/auth";
import { db } from "@repo/database";
import { zValidator } from "@hono/zod-validator";
import { StatusCode } from "hono/utils/http-status";

const app = new Hono();

// Profile update schema
const ProfileUpdateSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	username: z.string().optional(),
	matricNumber: z.string().optional(),
	department: z.string().optional(),
	level: z.number().min(100).max(800).optional(),
	phone: z.string().optional(),
	bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
	location: z.string().optional(),
	dateOfBirth: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

// Notification preferences schema
const NotificationPreferencesSchema = z.object({
	// Email notifications
	emailBookingConfirmations: z.boolean(),
	emailBookingReminders: z.boolean(),
	emailBookingUpdates: z.boolean(),
	emailPaymentConfirmations: z.boolean(),
	emailReviewRequests: z.boolean(),
	emailPromotions: z.boolean(),
	
	// SMS notifications  
	smsBookingReminders: z.boolean(),
	smsBookingConfirmations: z.boolean(),
	smsPaymentAlerts: z.boolean(),
	smsEmergencyAlerts: z.boolean(),
	
	// Push notifications
	pushBookingUpdates: z.boolean(),
	pushNewMessages: z.boolean(),
	pushProviderUpdates: z.boolean(),
	pushPromotions: z.boolean(),
	
	// Timing preferences
	reminderTiming: z.string(),
	digestFrequency: z.string(),
	
	// Communication preferences
	communicationLanguage: z.string(),
	timezone: z.string(),
});

// Get current user profile
app.get("/", async (c) => {
	try {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});

		if (!session || !session.user || !session.user.id) {
			return c.json(
				{
					success: false,
					error: "Unauthorized - Please log in",
				},
				401 as StatusCode
			);
		}

		// Store user data immediately to avoid potential race conditions
		const userId = session.user.id;

		const user = await db.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				email: true,
				username: true,
				matricNumber: true,
				department: true,
				level: true,
				image: true,
				verified: true,
				isStudentVerified: true,
				phone: true,
				bio: true,
				location: true,
				dateOfBirth: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!user) {
			return c.json(
				{
					success: false,
					error: "User not found",
				},
				404 as StatusCode
			);
		}

		return c.json({
			success: true,
			data: user,
		});
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return c.json(
			{
				success: false,
				error: "Internal server error",
			},
			500 as StatusCode
		);
	}
});

// Update user profile
app.patch("/profile", zValidator("json", ProfileUpdateSchema), async (c) => {
	try {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});

		if (!session || !session.user) {
			return c.json(
				{
					success: false,
					error: "Unauthorized - Please log in",
				},
				401 as StatusCode
			);
		}

		const data = c.req.valid("json");
		// Store user ID immediately
		const userId = session.user.id;

		// Check if username is unique (if provided)
		if (data.username) {
			const existingUser = await db.user.findFirst({
				where: {
					username: data.username,
					id: { not: userId }, // Exclude current user
				},
			});

			if (existingUser) {
				return c.json(
					{
						success: false,
						error: "Username is already taken",
					},
					400 as StatusCode
				);
			}
		}

		// Check if matric number is unique (if provided)
		if (data.matricNumber) {
			const existingUser = await db.user.findFirst({
				where: {
					matricNumber: data.matricNumber,
					id: { not: userId }, // Exclude current user
				},
			});

			if (existingUser) {
				return c.json(
					{
						success: false,
						error: "Matric number is already registered",
					},
					400 as StatusCode
				);
			}
		}

		const updatedUser = await db.user.update({
			where: { id: userId },
			data: {
				name: data.name,
				username: data.username || null,
				matricNumber: data.matricNumber || null,
				department: data.department || null,
				level: data.level || null,
				phone: data.phone || null,
				bio: data.bio || null,
				location: data.location || null,
				dateOfBirth: data.dateOfBirth || null,
			},
			select: {
				id: true,
				name: true,
				email: true,
				username: true,
				matricNumber: true,
				department: true,
				level: true,
				image: true,
				verified: true,
				isStudentVerified: true,
				phone: true,
				bio: true,
				location: true,
				dateOfBirth: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return c.json({
			success: true,
			data: updatedUser,
		});
	} catch (error) {
		console.error("Error updating user profile:", error);
		return c.json(
			{
				success: false,
				error: "Internal server error",
			},
			500 as StatusCode
		);
	}
});

// Get notification settings
app.get("/notification-settings", async (c) => {
	try {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});

		if (!session || !session.user) {
			return c.json(
				{
					success: false,
					error: "Unauthorized - Please log in",
				},
				401 as StatusCode
			);
		}

		// For now, return default notification settings
		// In a real app, these would be stored in a separate table
		const defaultSettings = {
			// Email defaults
			emailBookingConfirmations: true,
			emailBookingReminders: true,
			emailBookingUpdates: true,
			emailPaymentConfirmations: true,
			emailReviewRequests: true,
			emailPromotions: false,
			
			// SMS defaults
			smsBookingReminders: false,
			smsBookingConfirmations: false,
			smsPaymentAlerts: false,
			smsEmergencyAlerts: true,
			
			// Push defaults
			pushBookingUpdates: true,
			pushNewMessages: true,
			pushProviderUpdates: false,
			pushPromotions: false,
			
			// Timing defaults
			reminderTiming: "2h",
			digestFrequency: "weekly",
			
			// Communication defaults
			communicationLanguage: "en",
			timezone: "Africa/Lagos",
		};

		return c.json({
			success: true,
			data: defaultSettings,
		});
	} catch (error) {
		console.error("Error fetching notification settings:", error);
		return c.json(
			{
				success: false,
				error: "Internal server error",
			},
			500 as StatusCode
		);
	}
});

// Update notification settings
app.patch("/notification-settings", zValidator("json", NotificationPreferencesSchema), async (c) => {
	try {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});

		if (!session || !session.user) {
			return c.json(
				{
					success: false,
					error: "Unauthorized - Please log in",
				},
				401 as StatusCode
			);
		}

		const settings = c.req.valid("json");

		// In a real app, you would store these settings in a database
		// For now, we'll just return the settings as if they were saved
		// You would typically create a NotificationSettings table and save these there

		return c.json({
			success: true,
			data: settings,
		});
	} catch (error) {
		console.error("Error updating notification settings:", error);
		return c.json(
			{
				success: false,
				error: "Internal server error",
			},
			500 as StatusCode
		);
	}
});

// Upload profile image
app.post("/upload-image", async (c) => {
	try {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});

		if (!session || !session.user) {
			return c.json(
				{
					success: false,
					error: "Unauthorized - Please log in",
				},
				401 as StatusCode
			);
		}

		const formData = await c.req.formData();
		const file = formData.get('image') as File;

		if (!file) {
			return c.json(
				{
					success: false,
					error: "No image file provided",
				},
				400 as StatusCode
			);
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			return c.json(
				{
					success: false,
					error: "File must be an image",
				},
				400 as StatusCode
			);
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			return c.json(
				{
					success: false,
					error: "Image size must be less than 5MB",
				},
				400 as StatusCode
			);
		}

		const userId = session.user.id;

		// For now, we'll convert the image to base64 and store it directly
		// In production, you'd want to upload to a cloud storage service
		const arrayBuffer = await file.arrayBuffer();
		const base64 = Buffer.from(arrayBuffer).toString('base64');
		const imageUrl = `data:${file.type};base64,${base64}`;

		// Update user with new image
		const updatedUser = await db.user.update({
			where: { id: userId },
			data: { image: imageUrl },
			select: {
				id: true,
				name: true,
				email: true,
				username: true,
				matricNumber: true,
				department: true,
				level: true,
				image: true,
				verified: true,
				isStudentVerified: true,
				phone: true,
				bio: true,
				location: true,
				dateOfBirth: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return c.json({
			success: true,
			data: updatedUser,
			message: "Profile image updated successfully",
		});
	} catch (error) {
		console.error("Error uploading profile image:", error);
		return c.json(
			{
				success: false,
				error: "Internal server error",
			},
			500 as StatusCode
		);
	}
});

export default app;
