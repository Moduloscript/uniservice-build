export interface ProviderAvailability {
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

export interface RecurringSchedulePattern {
	type: 'weekly' | 'monthly' | 'daily';
	interval: number; // Every X weeks/months/days
	daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for weekly
	dayOfMonth?: number; // 1-31 for monthly
	endDate?: string;
	occurrences?: number;
}

export interface CreateRecurringSchedule {
	serviceId?: string;
	startTime: string;
	endTime: string;
	maxBookings?: number;
	notes?: string;
	pattern: RecurringSchedulePattern;
	startDate: string;
}

export interface UpdateAvailabilitySlot {
	isAvailable?: boolean;
	maxBookings?: number;
	notes?: string;
}

export interface AvailabilityTimeSlot {
	id: string;
	date: string;
	startTime: string;
	endTime: string;
	isAvailable: boolean;
	isBooked: boolean;
	availableSpots: number;
	totalSpots: number;
	displayTime: string;
	service?: {
		id: string;
		name: string;
		duration: number;
	};
}

export interface AvailabilityCalendarProps {
	providerId: string;
	serviceId?: string;
	onSlotSelect?: (slot: AvailabilityTimeSlot) => void;
	showBookedSlots?: boolean;
	readonly?: boolean;
}
