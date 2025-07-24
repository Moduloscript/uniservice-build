import { db } from "@repo/database";
import { format } from "date-fns";

/**
 * Updates provider availability when a booking is created
 * Increments currentBookings count and marks slot as booked if at capacity
 */
export async function updateAvailabilityOnBookingCreate(
	providerId: string,
	serviceId: string,
	dateTime: Date
): Promise<{ success: boolean; message?: string }> {
	try {
		// Extract date and time components
		const bookingDate = format(dateTime, "yyyy-MM-dd");
		const bookingTime = format(dateTime, "HH:mm:ss");

		// Find the availability slot that matches this booking
		const availabilitySlot = await db.providerAvailability.findFirst({
			where: {
				providerId,
				date: new Date(bookingDate),
				startTime: {
					// Find slot where booking time falls within the slot's time range
					lte: new Date(`1970-01-01T${bookingTime}`)
				},
				endTime: {
					gte: new Date(`1970-01-01T${bookingTime}`)
				},
				isAvailable: true,
				...(serviceId && { serviceId }),
			},
		});

		if (!availabilitySlot) {
			// No matching availability slot found - this might be OK for legacy bookings
			// or bookings that don't use the availability system
			return {
				success: true,
				message: "No matching availability slot found - booking allowed without slot update",
			};
		}

		// Check if slot has capacity
		if (availabilitySlot.currentBookings >= availabilitySlot.maxBookings) {
			return {
				success: false,
				message: "Availability slot is at maximum capacity",
			};
		}

		// Update the availability slot
		const newCurrentBookings = availabilitySlot.currentBookings + 1;
		const shouldMarkAsBooked = newCurrentBookings >= availabilitySlot.maxBookings;

		await db.providerAvailability.update({
			where: { id: availabilitySlot.id },
			data: {
				currentBookings: newCurrentBookings,
				isBooked: shouldMarkAsBooked,
				// Keep isAvailable as true unless explicitly marked as booked
				isAvailable: !shouldMarkAsBooked,
			},
		});

		return {
			success: true,
			message: `Availability updated: ${newCurrentBookings}/${availabilitySlot.maxBookings} bookings`,
		};
	} catch (error) {
		console.error("Error updating availability on booking create:", error);
		return {
			success: false,
			message: "Failed to update availability",
		};
	}
}

/**
 * Updates provider availability when a booking is cancelled
 * Decrements currentBookings count and marks slot as available if below capacity
 */
export async function updateAvailabilityOnBookingCancel(
	providerId: string,
	serviceId: string,
	dateTime: Date
): Promise<{ success: boolean; message?: string }> {
	try {
		// Extract date and time components
		const bookingDate = format(dateTime, "yyyy-MM-dd");
		const bookingTime = format(dateTime, "HH:mm:ss");

		// Find the availability slot that matches this booking
		const availabilitySlot = await db.providerAvailability.findFirst({
			where: {
				providerId,
				date: new Date(bookingDate),
				startTime: {
					lte: new Date(`1970-01-01T${bookingTime}`)
				},
				endTime: {
					gte: new Date(`1970-01-01T${bookingTime}`)
				},
				...(serviceId && { serviceId }),
			},
		});

		if (!availabilitySlot) {
			// No matching availability slot found - this might be OK for legacy bookings
			return {
				success: true,
				message: "No matching availability slot found - cancellation allowed without slot update",
			};
		}

		// Update the availability slot
		const newCurrentBookings = Math.max(0, availabilitySlot.currentBookings - 1);
		const shouldMarkAsAvailable = newCurrentBookings < availabilitySlot.maxBookings;

		await db.providerAvailability.update({
			where: { id: availabilitySlot.id },
			data: {
				currentBookings: newCurrentBookings,
				isBooked: !shouldMarkAsAvailable,
				isAvailable: shouldMarkAsAvailable,
			},
		});

		return {
			success: true,
			message: `Availability updated: ${newCurrentBookings}/${availabilitySlot.maxBookings} bookings`,
		};
	} catch (error) {
		console.error("Error updating availability on booking cancel:", error);
		return {
			success: false,
			message: "Failed to update availability",
		};
	}
}

/**
 * Validates if a booking can be made based on current availability
 * This is a pre-check before creating a booking
 */
export async function validateBookingAvailability(
	providerId: string,
	serviceId: string,
	dateTime: Date
): Promise<{ isValid: boolean; message?: string; availabilitySlot?: any }> {
	try {
		// Extract date and time components
		const bookingDate = format(dateTime, "yyyy-MM-dd");
		const bookingTime = format(dateTime, "HH:mm:ss");

		// Find the availability slot that matches this booking
		const availabilitySlot = await db.providerAvailability.findFirst({
			where: {
				providerId,
				date: new Date(bookingDate),
				startTime: {
					lte: new Date(`1970-01-01T${bookingTime}`)
				},
				endTime: {
					gte: new Date(`1970-01-01T${bookingTime}`)
				},
				isAvailable: true,
				...(serviceId && { serviceId }),
			},
		});

		if (!availabilitySlot) {
			return {
				isValid: false,
				message: "No available time slot found for the selected date and time",
			};
		}

		if (availabilitySlot.currentBookings >= availabilitySlot.maxBookings) {
			return {
				isValid: false,
				message: "This time slot is fully booked",
			};
		}

		return {
			isValid: true,
			message: "Time slot is available for booking",
			availabilitySlot,
		};
	} catch (error) {
		console.error("Error validating booking availability:", error);
		return {
			isValid: false,
			message: "Error checking availability",
		};
	}
}

/**
 * Get current booking statistics for an availability slot
 */
export async function getAvailabilityStats(availabilityId: string) {
	try {
		const slot = await db.providerAvailability.findUnique({
			where: { id: availabilityId },
			include: {
				service: {
					select: {
						id: true,
						name: true,
						duration: true,
					},
				},
			},
		});

		if (!slot) {
			return null;
		}

		return {
			id: slot.id,
			date: slot.date,
			startTime: slot.startTime,
			endTime: slot.endTime,
			currentBookings: slot.currentBookings,
			maxBookings: slot.maxBookings,
			availableSpots: slot.maxBookings - slot.currentBookings,
			isAvailable: slot.isAvailable,
			isBooked: slot.isBooked,
			service: slot.service,
		};
	} catch (error) {
		console.error("Error getting availability stats:", error);
		return null;
	}
}
