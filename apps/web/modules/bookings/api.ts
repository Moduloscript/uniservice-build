import type {
	Booking,
	CreateBookingRequest,
	UpdateBookingRequest,
	BookingListResponse,
	BookingResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Create a new booking
export async function createBooking(
	data: CreateBookingRequest,
): Promise<Booking> {
	const response = await fetch(`${API_BASE_URL}/bookings`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const contentType = response.headers.get('content-type');
		
		try {
			if (contentType?.includes('application/json')) {
				const errorResponse = await response.json();
				console.error('Booking creation failed (JSON):', {
					status: response.status,
					statusText: response.statusText,
					errorResponse,
					data
				});
				
				// Handle different error response formats
				let errorMessage = "Failed to create booking";
				
				if (typeof errorResponse.error === 'string') {
					// Format: { error: "message" }
					errorMessage = errorResponse.error;
				} else if (typeof errorResponse.error === 'object' && errorResponse.error.message) {
					// Format: { error: { message: "message" } }
					errorMessage = errorResponse.error.message;
				} else if (errorResponse.message) {
					// Format: { message: "message" }
					errorMessage = errorResponse.message;
				} else if (errorResponse.success === false && errorResponse.error) {
					// Format: { success: false, error: {...} }
					errorMessage = JSON.stringify(errorResponse.error);
				}
				
				throw new Error(errorMessage);
			} else {
				// Handle text/html or other content types
				const errorText = await response.text();
				console.error('Booking creation failed (Text):', {
					status: response.status,
					statusText: response.statusText,
					errorText: errorText.substring(0, 500), // Log first 500 chars
					contentType,
					data
				});
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
		} catch (parseError) {
			console.error('Failed to parse error response:', {
				status: response.status,
				statusText: response.statusText,
				parseError: parseError.message,
				contentType
			});
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
	}

	const result: BookingResponse = await response.json();
	return result.booking;
}

// Get all bookings for current user
export async function fetchBookings(): Promise<Booking[]> {
	const response = await fetch(`${API_BASE_URL}/bookings`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to fetch bookings");
	}

	const result: BookingListResponse = await response.json();
	return result.bookings;
}

// Get a specific booking by ID
export async function fetchBookingById(id: string): Promise<Booking> {
	const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to fetch booking");
	}

	const result: BookingResponse = await response.json();
	return result.booking;
}

// Update booking status
export async function updateBookingStatus(
	id: string,
	data: UpdateBookingRequest,
): Promise<Booking> {
	const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to update booking");
	}

	const result: BookingResponse = await response.json();
	return result.booking;
}

// Cancel a booking
export async function cancelBooking(id: string): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to cancel booking");
	}
}

// Payment initialization types
export interface PaymentInitializeRequest {
	bookingId: string;
	redirectUrl?: string;
}

export interface PaymentInitializeResponse {
	success: boolean;
	data: {
		paymentId: string;
		transactionRef: string;
		amount: number;
		currency: string;
		paymentUrl: string;
		service: {
			id: string;
			name: string;
			price: number;
		};
		booking: {
			id: string;
			status: string;
		};
		redirectUrl: string;
	};
}

export interface PaymentVerifyResponse {
	success: boolean;
	data: {
		paymentId: string;
		transactionRef: string;
		amount: number;
		currency: string;
		status: string;
		paidAt: string | null;
		verifiedAt: string | null;
		booking: {
			id: string;
			status: string;
			service: {
				name: string;
				price: number;
			};
		};
	};
}

// Initialize payment for a booking
export async function initializePayment(
	data: PaymentInitializeRequest,
): Promise<PaymentInitializeResponse> {
	const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to initialize payment");
	}

	return response.json();
}

// Verify payment status
export async function verifyPayment(
	transactionRef: string,
): Promise<PaymentVerifyResponse> {
	const response = await fetch(`${API_BASE_URL}/payments/verify/${transactionRef}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to verify payment");
	}

	return response.json();
}
