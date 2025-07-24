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
	dateTime: string;
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
	sortBy: "dateTime" | "createdAt" | "updatedAt";
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
		sortBy = "dateTime",
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
