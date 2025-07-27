import { z } from "zod";

// Dashboard query schemas
export const dashboardSummaryQuerySchema = z.object({
	startDate: z
		.string()
		.optional()
		.refine((date) => !date || !isNaN(Date.parse(date)), {
			message: "Invalid start date format",
		}),
	endDate: z
		.string()
		.optional()
		.refine((date) => !date || !isNaN(Date.parse(date)), {
			message: "Invalid end date format",
		}),
});

// Earnings query schemas
export const earningsQuerySchema = z.object({
	page: z
		.string()
		.transform((val) => Math.max(parseInt(val) || 1, 1))
		.optional(),
	limit: z
		.string()
		.transform((val) => Math.min(Math.max(parseInt(val) || 20, 1), 100))
		.optional(),
	status: z
		.enum(["PENDING_CLEARANCE", "AVAILABLE", "PAID_OUT", "FROZEN"])
		.optional(),
	startDate: z
		.string()
		.optional()
		.refine((date) => !date || !isNaN(Date.parse(date)), {
			message: "Invalid start date format",
		}),
	endDate: z
		.string()
		.optional()
		.refine((date) => !date || !isNaN(Date.parse(date)), {
			message: "Invalid end date format",
		}),
	cursor: z.string().uuid().optional(),
});

// Analytics query schemas
export const analyticsQuerySchema = z.object({
	report: z.enum([
		"earnings_by_service",
		"earnings_over_time",
		"bookings_over_time",
		"payout_history",
	]),
	startDate: z
		.string()
		.optional()
		.refine((date) => !date || !isNaN(Date.parse(date)), {
			message: "Invalid start date format",
		}),
	endDate: z
		.string()
		.optional()
		.refine((date) => !date || !isNaN(Date.parse(date)), {
			message: "Invalid end date format",
		}),
	period: z.enum(["day", "week", "month"]).default("month"),
});

// Payout request schemas
export const payoutRequestSchema = z.object({
	amount: z
		.number()
		.positive("Payout amount must be positive")
		.min(100, "Minimum payout amount is ₦100")
		.max(1000000, "Maximum payout amount is ₦1,000,000"),
	accountNumber: z
		.string()
		.min(10, "Account number must be at least 10 characters")
		.max(20, "Account number must not exceed 20 characters")
		.regex(/^\d+$/, "Account number must contain only digits"),
	accountName: z
		.string()
		.min(3, "Account name is required")
		.max(100, "Account name must not exceed 100 characters")
		.trim(),
	bankCode: z
		.string()
		.min(3, "Bank code is required")
		.max(10, "Bank code must not exceed 10 characters"),
	bankName: z
		.string()
		.min(3, "Bank name is required")
		.max(100, "Bank name must not exceed 100 characters")
		.trim(),
	paymentProvider: z.enum(["PAYSTACK", "FLUTTERWAVE"]),
});

// Payout query schemas
export const payoutQuerySchema = z.object({
	page: z
		.string()
		.transform((val) => Math.max(parseInt(val) || 1, 1))
		.optional(),
	limit: z
		.string()
		.transform((val) => Math.min(Math.max(parseInt(val) || 20, 1), 100))
		.optional(),
	status: z
		.enum(["REQUESTED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"])
		.optional(),
	startDate: z
		.string()
		.optional()
		.refine((date) => !date || !isNaN(Date.parse(date)), {
			message: "Invalid start date format",
		}),
	endDate: z
		.string()
		.optional()
		.refine((date) => !date || !isNaN(Date.parse(date)), {
			message: "Invalid end date format",
		}),
});

// Response type definitions for TypeScript
export type DashboardSummaryQuery = z.infer<typeof dashboardSummaryQuerySchema>;
export type EarningsQuery = z.infer<typeof earningsQuerySchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type PayoutRequest = z.infer<typeof payoutRequestSchema>;
export type PayoutQuery = z.infer<typeof payoutQuerySchema>;

// Response schema definitions for OpenAPI documentation
export const earningsResponseSchema = z.object({
	data: z.array(
		z.object({
			id: z.string().uuid(),
			amount: z.number(),
			platformFee: z.number().optional(),
			grossAmount: z.number(),
			currency: z.string(),
			status: z.enum(["PENDING_CLEARANCE", "AVAILABLE", "PAID_OUT", "FROZEN"]),
			clearedAt: z.string().datetime().nullable(),
			createdAt: z.string().datetime(),
			booking: z.object({
				id: z.string().uuid(),
				service: z.object({
					name: z.string(),
					category: z.object({
						name: z.string(),
					}),
				}),
				student: z.object({
					name: z.string(),
				}),
			}),
		})
	),
	meta: z.object({
		pagination: z.object({
			page: z.number(),
			limit: z.number(),
			total: z.number(),
			totalPages: z.number(),
			hasNextPage: z.boolean(),
			hasPrevPage: z.boolean(),
			nextCursor: z.string().uuid().nullable(),
		}),
	}),
});

export const dashboardSummaryResponseSchema = z.object({
	data: z.object({
		earnings: z.object({
			totalLifetime: z.number(),
			availableBalance: z.number(),
			pendingClearance: z.number(),
			thisMonth: z.number(),
			lastMonth: z.number(),
			currency: z.string(),
		}),
		payouts: z.object({
			totalPaidOut: z.number(),
			pendingPayouts: z.number(),
			lastPayoutDate: z.string().datetime().nullable(),
		}),
		performance: z.object({
			totalBookings: z.number(),
			completedBookings: z.number(),
			averageRating: z.number(),
			totalStudents: z.number(),
		}),
	}),
});

export const payoutResponseSchema = z.object({
	data: z.object({
		id: z.string().uuid(),
		amount: z.number(),
		status: z.enum(["REQUESTED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]),
		createdAt: z.string().datetime(),
	}),
	message: z.string(),
});
