import { apiClient } from "@/modules/shared/lib/api-client";

// Types for API responses
export interface ProviderDashboardStats {
	services: {
		total: number;
		active: number;
		inactive: number;
	};
	bookings: {
		total: number;
		pending: number;
		confirmed: number;
		completed: number;
		cancelled: number;
	};
	revenue: {
		total: number;
		thisMonth: number;
		lastMonth: number;
		currency: string;
	};
	students: {
		total: number;
		active: number;
		thisMonth: number;
	};
}

export interface ProviderService {
	id: string;
	name: string;
	description: string;
	price: number;
	duration: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	category: {
		id: string;
		name: string;
		description: string;
	};
	_count: {
		bookings: number;
		features: number;
	};
}

export interface ProviderServicesSummary {
	total: number;
	active: number;
	inactive: number;
	recentServices: Array<{
		id: string;
		name: string;
		price: number;
		isActive: boolean;
		createdAt: string;
		category: {
			name: string;
		};
	}>;
}

export interface ProviderBooking {
	id: string;
	status: string;
	dateTime: string;
	createdAt: string;
	student: {
		name: string;
		email: string;
	};
	service: {
		name: string;
		price: number;
	};
}

export interface ProviderBookingsRecent {
	bookings: ProviderBooking[];
}

// Provider Availability Types
export interface ProviderAvailabilitySlot {
	id: string;
	providerId: string;
	serviceId?: string;
	date: string;
	startTime: string;
	endTime: string;
	isAvailable: boolean;
	isBooked: boolean;
	maxBookings: number;
	currentBookings: number;
	notes?: string;
	createdAt: string;
	updatedAt: string;
	service?: {
		id: string;
		name: string;
		duration: number;
	};
}

export interface CreateAvailabilitySlot {
	serviceId?: string;
	date: string;
	startTime: string;
	endTime: string;
	maxBookings?: number;
	notes?: string;
}

export interface UpdateAvailabilitySlot {
	isAvailable?: boolean;
	maxBookings?: number;
	notes?: string;
}

export interface BulkCreateAvailabilitySlots {
	slots: CreateAvailabilitySlot[];
}

export interface RecurringSchedule {
	dayOfWeek: number; // 0-6 (Sunday-Saturday)
	startTime: string;
	endTime: string;
	maxBookings?: number;
	notes?: string;
	serviceId?: string;
}

// Provider Dashboard API functions
export const providerDashboardApi = {
	// Get comprehensive dashboard statistics
	async getStats(params?: {
		startDate?: string;
		endDate?: string;
	}): Promise<ProviderDashboardStats> {
		const query: Record<string, string> = {};
		if (params?.startDate) query.startDate = params.startDate;
		if (params?.endDate) query.endDate = params.endDate;

		const response = await apiClient.provider.dashboard.stats.$get({
			query,
		});

		if (!response.ok) {
			throw new Error("Failed to fetch provider dashboard stats");
		}

		return response.json();
	},

	// Get services summary for dashboard
	async getServicesSummary(): Promise<ProviderServicesSummary> {
		const response = await apiClient.provider.services.summary.$get();

		if (!response.ok) {
			throw new Error("Failed to fetch provider services summary");
		}

		return response.json();
	},

	// Get recent bookings for dashboard
	async getRecentBookings(
		limit = 5,
	): Promise<ProviderBookingsRecent> {
		const response = await apiClient.provider.bookings.recent.$get({
			query: { limit: limit.toString() },
		});

		if (!response.ok) {
			throw new Error("Failed to fetch recent bookings");
		}

		return response.json();
	},
};

// Provider Availability API functions
export const providerAvailabilityApi = {
	// Get provider availability for a date range
	async getAvailability(
		providerId: string,
		params?: { startDate?: string; endDate?: string; serviceId?: string },
	): Promise<{ success: boolean; data: ProviderAvailabilitySlot[] }> {
		const query: Record<string, string> = {};
		if (params?.startDate) query.startDate = params.startDate;
		if (params?.endDate) query.endDate = params.endDate;
		if (params?.serviceId) query.serviceId = params.serviceId;

		const response = await fetch(
			`/api/providers/${providerId}/availability?${new URLSearchParams(query)}`,
		);

		if (!response.ok) {
			throw new Error("Failed to fetch provider availability");
		}

		return response.json();
	},

	// Create a new availability slot
	async createSlot(
		providerId: string,
		slotData: CreateAvailabilitySlot,
	): Promise<{
		success: boolean;
		data: ProviderAvailabilitySlot;
		message: string;
	}> {
		const response = await fetch(
			`/api/providers/${providerId}/availability`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(slotData),
			},
		);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(
				error.error || "Failed to create availability slot",
			);
		}

		return response.json();
	},

	// Update an existing availability slot
	async updateSlot(
		providerId: string,
		availabilityId: string,
		updateData: UpdateAvailabilitySlot,
	): Promise<{
		success: boolean;
		data: ProviderAvailabilitySlot;
		message: string;
	}> {
		const response = await fetch(
			`/api/providers/${providerId}/availability/${availabilityId}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			},
		);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(
				error.error || "Failed to update availability slot",
			);
		}

		return response.json();
	},

	// Delete an availability slot
	async deleteSlot(
		providerId: string,
		availabilityId: string,
	): Promise<{ success: boolean; message: string }> {
		const response = await fetch(
			`/api/providers/${providerId}/availability/${availabilityId}`,
			{
				method: "DELETE",
			},
		);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(
				error.error || "Failed to delete availability slot",
			);
		}

		return response.json();
	},

	// Create multiple availability slots at once
	async createBulkSlots(
		providerId: string,
		bulkData: BulkCreateAvailabilitySlots,
	): Promise<{
		success: boolean;
		data: ProviderAvailabilitySlot[];
		message: string;
	}> {
		const response = await fetch(
			`/api/providers/${providerId}/availability/bulk`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(bulkData),
			},
		);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(
				error.error || "Failed to create bulk availability slots",
			);
		}

		return response.json();
	},

	// Generate recurring weekly schedule
	async createRecurringSchedule(
		providerId: string,
		schedule: RecurringSchedule,
		weeksAhead = 4,
	): Promise<{
		success: boolean;
		data: ProviderAvailabilitySlot[];
		message: string;
	}> {
		const slots: CreateAvailabilitySlot[] = [];
		const startDate = new Date();

		// Generate slots for the specified number of weeks
		for (let week = 0; week < weeksAhead; week++) {
			const targetDate = new Date(startDate);
			targetDate.setDate(
				startDate.getDate() +
					week * 7 +
					(schedule.dayOfWeek - startDate.getDay()),
			);

			// Skip if the date is in the past
			if (targetDate < new Date()) continue;

			slots.push({
				date: targetDate.toISOString().split("T")[0],
				startTime: schedule.startTime,
				endTime: schedule.endTime,
				maxBookings: schedule.maxBookings || 1,
				notes: schedule.notes,
				serviceId: schedule.serviceId,
			});
		}

		return this.createBulkSlots(providerId, { slots });
	},
};

// React Query keys for consistent caching
export const providerDashboardQueryKeys = {
	all: ["provider-dashboard"] as const,
	stats: (params?: { startDate?: string; endDate?: string }) =>
		["provider-dashboard", "stats", params] as const,
	servicesSummary: () => ["provider-dashboard", "services-summary"] as const,
	recentBookings: (limit = 5) =>
		["provider-dashboard", "recent-bookings", limit] as const,
};

export const providerAvailabilityQueryKeys = {
	all: ["provider-availability"] as const,
	byProvider: (providerId: string) =>
		["provider-availability", providerId] as const,
	availability: (
		providerId: string,
		params?: { startDate?: string; endDate?: string; serviceId?: string },
	) => ["provider-availability", providerId, "list", params] as const,
};
