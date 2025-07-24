import { Hono } from "hono";
import { z } from "zod";
import { auth } from "@repo/auth";
import { database } from "@repo/database";
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
	dateOfBirth: z.string().optional(),
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
			headers: c.req.header(),
		});

		if (!session) {
			return c.json(
				{
					success: false,
					error: "Unauthorized - Please log in",
				},
				401 as StatusCode
			);
		}

		const user = await database.user.findUnique({
			where: { id: session.user.id },
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
				createdAt: true,
				updatedAt: true,
				// Add additional fields that might be stored in a separate profile table
				// For now, we'll use the user table directly
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
			headers: c.req.header(),
		});

		if (!session) {
			return c.json(
				{
					success: false,
					error: "Unauthorized - Please log in",
				},
				401 as StatusCode
			);
		}

		const data = c.req.valid("json");

		// Check if username is unique (if provided)
		if (data.username) {
			const existingUser = await database.user.findFirst({
				where: {
					username: data.username,
					id: { not: session.user.id }, // Exclude current user
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
			const existingUser = await database.user.findFirst({
				where: {
					matricNumber: data.matricNumber,
					id: { not: session.user.id }, // Exclude current user
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

		const updatedUser = await database.user.update({
			where: { id: session.user.id },
			data: {
				name: data.name,
				username: data.username || null,
				matricNumber: data.matricNumber || null,
				department: data.department || null,
				level: data.level || null,
				// Note: Additional fields like phone, bio, location, dateOfBirth
				// might need to be stored in a separate profile table
				// For now, we'll focus on the core user fields
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
			headers: c.req.header(),
		});

		if (!session) {
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
			headers: c.req.header(),
		});

		if (!session) {
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

export default app;
