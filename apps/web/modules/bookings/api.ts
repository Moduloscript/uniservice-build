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
		const error = await response.json();
		throw new Error(error.error || "Failed to create booking");
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
