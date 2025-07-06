// Booking types for frontend usage
export interface Booking {
	id: string;
	studentId: string;
	providerId: string;
	serviceId: string;
	status: BookingStatus;
	dateTime: string;
	createdAt: string;
	updatedAt: string;
	service?: {
		id: string;
		name: string;
		description: string;
		price: number;
		duration: number;
		category?: {
			id: string;
			name: string;
			description?: string;
		};
	};
}

export type BookingStatus = 
	| "PENDING" 
	| "CONFIRMED" 
	| "COMPLETED" 
	| "CANCELLED" 
	| "REFUNDED";

export interface CreateBookingRequest {
	serviceId: string;
	dateTime: string;
}

export interface UpdateBookingRequest {
	status?: BookingStatus;
}

export interface BookingListResponse {
	bookings: Booking[];
}

export interface BookingResponse {
	booking: Booking;
}
