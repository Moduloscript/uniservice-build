import { apiClient } from "@/modules/shared/lib/api-client";

// Types for API responses
export interface StudentDashboardStats {
	totalBookings: number;
	completedBookings: number;
	totalSpent: number;
	upcomingCount: number;
}

export interface StudentBooking {
	id: string;
	scheduledFor: string;
	status: string;
	service: {
		name: string;
		price: number;
		duration?: number;
		category: {
			name: string;
		};
	};
	provider: {
		name: string;
		image?: string;
	};
	createdAt?: string;
	updatedAt?: string;
}

export interface StudentProvider {
	id: string;
	name: string;
	image?: string;
	bookingCount: number;
	_count: {
		services: number;
	};
}

export interface StudentDashboardSummary {
	upcomingBookings: StudentBooking[];
	recentActivity: StudentBooking[];
	myProviders: StudentProvider[];
	stats: StudentDashboardStats;
}

// Extended booking interface for detailed booking history
export interface DetailedStudentBooking extends StudentBooking {
	notes?: string;
	payment?: {
		id: string;
		amount: number;
		status: string;
		paymentMethod: string;
		transactionReference?: string;
	};
}

// Pagination interface
export interface Pagination {
	page: number;
	limit: number;
	totalCount: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

// Booking filters interface
export interface BookingFilters {
	status: "all" | "upcoming" | "completed" | "cancelled" | "pending" | "confirmed";
	sortBy: "scheduledFor" | "createdAt" | "updatedAt";
	sortOrder: "asc" | "desc";
}

// Bookings response interface
export interface StudentBookingsResponse {
	bookings: DetailedStudentBooking[];
	pagination: Pagination;
	filters: BookingFilters;
}

// Student Dashboard API functions
export const studentDashboardApi = {
	// Get comprehensive dashboard summary
	async getSummary(): Promise<StudentDashboardSummary> {
		const response = await apiClient.student.dashboard.summary.$get();

		if (!response.ok) {
			throw new Error("Failed to fetch student dashboard summary");
		}

		const result = await response.json();
		
		if (!result.success) {
			throw new Error(result.error || "Failed to fetch dashboard data");
		}

		return result.data;
	},
};

// Student Bookings API functions
export const studentBookingsApi = {
	// Get bookings with filtering and pagination
	async getBookings({
		status = "all",
		page = 1,
		limit = 10,
		sortBy = "scheduledFor",
		sortOrder = "desc",
	}: Partial<BookingFilters & { page: number; limit: number }> = {}): Promise<StudentBookingsResponse> {
		const searchParams = new URLSearchParams({
			status,
			page: page.toString(),
			limit: limit.toString(),
			sortBy,
			sortOrder,
		});

		const response = await apiClient.student.bookings.$get({
			query: Object.fromEntries(searchParams),
		});

		if (!response.ok) {
			throw new Error("Failed to fetch student bookings");
		}

		const result = await response.json();
		
		if (!result.success) {
			throw new Error(result.error || "Failed to fetch bookings");
		}

		return result.data;
	},

	// Get booking details by ID
	async getBookingById(id: string): Promise<DetailedStudentBooking> {
		const response = await apiClient.student.bookings[":id"].$get({
			param: { id },
		});

		if (!response.ok) {
			throw new Error("Failed to fetch booking details");
		}

		const result = await response.json();
		
		if (!result.success) {
			throw new Error(result.error || "Failed to fetch booking details");
		}

		return result.data;
	},
};

// Query keys for React Query
export const studentDashboardQueryKeys = {
	all: ["student", "dashboard"] as const,
	summary: () => [...studentDashboardQueryKeys.all, "summary"] as const,
};

export const studentBookingsQueryKeys = {
	all: ["student", "bookings"] as const,
	list: (filters?: Partial<BookingFilters & { page: number; limit: number }>) => 
		[...studentBookingsQueryKeys.all, "list", filters] as const,
	detail: (id: string) => [...studentBookingsQueryKeys.all, "detail", id] as const,
};

// Profile management types
export interface StudentProfile {
	id: string;
	name: string;
	email: string;
	username?: string;
	matricNumber?: string;
	department?: string;
	level?: number;
	phone?: string;
	bio?: string;
	location?: string;
	dateOfBirth?: string;
	image?: string;
	createdAt: string;
	updatedAt: string;
}

export interface ProfileUpdateData {
	name: string;
	username?: string;
	matricNumber?: string;
	department?: string;
	level?: number;
	phone?: string;
	bio?: string;
	location?: string;
	dateOfBirth?: string;
}

// Notification preferences types
export interface NotificationPreferences {
	// Email notifications
	emailBookingConfirmations: boolean;
	emailBookingReminders: boolean;
	emailBookingUpdates: boolean;
	emailPaymentConfirmations: boolean;
	emailReviewRequests: boolean;
	emailPromotions: boolean;
	
	// SMS notifications  
	smsBookingReminders: boolean;
	smsBookingConfirmations: boolean;
	smsPaymentAlerts: boolean;
	smsEmergencyAlerts: boolean;
	
	// Push notifications
	pushBookingUpdates: boolean;
	pushNewMessages: boolean;
	pushProviderUpdates: boolean;
	pushPromotions: boolean;
	
	// Timing preferences
	reminderTiming: string;
	digestFrequency: string;
	
	// Communication preferences
	communicationLanguage: string;
	timezone: string;
}

// Student Profile API functions
export const studentProfileApi = {
	// Get current user profile
	async getProfile(): Promise<StudentProfile> {
		const response = await apiClient.users.me.$get();

		if (!response.ok) {
			throw new Error("Failed to fetch user profile");
		}

		const result = await response.json();
		
		if (!result.success) {
			throw new Error(result.error || "Failed to fetch profile data");
		}

		return result.data;
	},

	// Update user profile
	async updateProfile(data: ProfileUpdateData): Promise<StudentProfile> {
		const response = await apiClient.users.me.profile.$patch({
			json: data,
		});

		if (!response.ok) {
			throw new Error("Failed to update profile");
		}

		const result = await response.json();
		
		if (!result.success) {
			throw new Error(result.error || "Failed to update profile");
		}

		return result.data;
	},

	// Get notification preferences
	async getNotificationSettings(): Promise<NotificationPreferences> {
		const response = await apiClient.users.me["notification-settings"].$get();

		if (!response.ok) {
			throw new Error("Failed to fetch notification settings");
		}

		const result = await response.json();
		
		if (!result.success) {
			throw new Error(result.error || "Failed to fetch notification settings");
		}

		return result.data;
	},

	// Update notification preferences
	async updateNotificationSettings(settings: NotificationPreferences): Promise<NotificationPreferences> {
		const response = await apiClient.users.me["notification-settings"].$patch({
			json: settings,
		});

		if (!response.ok) {
			throw new Error("Failed to update notification settings");
		}

		const result = await response.json();
		
		if (!result.success) {
			throw new Error(result.error || "Failed to update notification settings");
		}

		return result.data;
	},

	// Upload profile image
	async uploadProfileImage(file: File): Promise<StudentProfile> {
		const formData = new FormData();
		formData.append('image', file);

		// Use direct fetch since Hono client may have issues with FormData
		const response = await fetch('/api/users/me/upload-image', {
			method: 'POST',
			body: formData,
			credentials: 'include',
		});

		if (!response.ok) {
			throw new Error(`Failed to upload profile image: ${response.status} ${response.statusText}`);
		}

		const result = await response.json();
		
		if (!result.success) {
			throw new Error(result.error || "Failed to upload profile image");
		}

		return result.data;
	},
};

// Profile query keys
export const studentProfileQueryKeys = {
	all: ["student", "profile"] as const,
	detail: () => [...studentProfileQueryKeys.all, "detail"] as const,
	notificationSettings: () => [...studentProfileQueryKeys.all, "notifications"] as const,
};
