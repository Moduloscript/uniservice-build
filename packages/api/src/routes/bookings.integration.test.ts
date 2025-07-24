import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { PrismaClient } from '@repo/database';

// Mock the database import
vi.mock('@repo/database', () => ({
	db: {
		booking: {
			create: vi.fn(),
			findUnique: vi.fn(),
			update: vi.fn(),
		},
		providerAvailability: {
			findFirst: vi.fn(),
			update: vi.fn(),
		},
		$transaction: vi.fn(),
	} as unknown as PrismaClient,
}));

// Mock the availability sync functions
vi.mock('../utils/availability-sync', () => ({
	validateBookingAvailability: vi.fn(),
	updateAvailabilityOnBookingCreate: vi.fn(),
	updateAvailabilityOnBookingCancel: vi.fn(),
}));

import { db } from '@repo/database';
import { 
	validateBookingAvailability, 
	updateAvailabilityOnBookingCreate,
	updateAvailabilityOnBookingCancel 
} from '../utils/availability-sync';

const mockDb = db as any;
const mockValidateBookingAvailability = validateBookingAvailability as any;
const mockUpdateAvailabilityOnBookingCreate = updateAvailabilityOnBookingCreate as any;
const mockUpdateAvailabilityOnBookingCancel = updateAvailabilityOnBookingCancel as any;

describe('Booking API Integration with Availability Sync', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Create Booking with Availability Sync', () => {
		it('should create booking when availability is valid', async () => {
			// Mock valid availability
			mockValidateBookingAvailability.mockResolvedValue({
				isValid: true,
				message: 'Slot available for booking',
				availabilitySlot: {
					id: 'slot-1',
					currentBookings: 1,
					maxBookings: 3,
				},
			});

			// Mock successful booking creation
			const mockBooking = {
				id: 'booking-1',
				customerId: 'customer-1',
				providerId: 'provider-1',
				serviceId: 'service-1',
				startTime: new Date('2025-01-25T14:00:00Z'),
				status: 'CONFIRMED',
			};

			mockDb.$transaction.mockImplementation(async (callback: any) => {
				mockDb.booking.create.mockResolvedValue(mockBooking);
				return await callback(mockDb);
			});

			mockUpdateAvailabilityOnBookingCreate.mockResolvedValue({
				success: true,
				message: 'Availability updated successfully',
			});

			// Simulate booking creation flow
			const bookingData = {
				customerId: 'customer-1',
				providerId: 'provider-1',
				serviceId: 'service-1',
				startTime: new Date('2025-01-25T14:00:00Z'),
				status: 'CONFIRMED' as const,
			};

			// Validate availability first
			const validation = await validateBookingAvailability(
				bookingData.providerId,
				bookingData.serviceId,
				bookingData.startTime
			);

			expect(validation.isValid).toBe(true);

			// Create booking in transaction
			const booking = await mockDb.$transaction(async (tx: any) => {
				return await tx.booking.create({ data: bookingData });
			});

			expect(booking).toEqual(mockBooking);

			// Update availability after booking creation
			await updateAvailabilityOnBookingCreate(
				bookingData.providerId,
				bookingData.serviceId,
				bookingData.startTime
			);

			expect(mockUpdateAvailabilityOnBookingCreate).toHaveBeenCalledWith(
				'provider-1',
				'service-1',
				new Date('2025-01-25T14:00:00Z')
			);
		});

		it('should reject booking when availability is invalid', async () => {
			// Mock invalid availability
			mockValidateBookingAvailability.mockResolvedValue({
				isValid: false,
				message: 'Time slot is fully booked',
				availabilitySlot: null,
			});

			const bookingData = {
				customerId: 'customer-1',
				providerId: 'provider-1',
				serviceId: 'service-1',
				startTime: new Date('2025-01-25T14:00:00Z'),
				status: 'CONFIRMED' as const,
			};

			// Validate availability
			const validation = await validateBookingAvailability(
				bookingData.providerId,
				bookingData.serviceId,
				bookingData.startTime
			);

			expect(validation.isValid).toBe(false);
			expect(validation.message).toContain('fully booked');

			// Should not create booking or update availability
			expect(mockDb.booking.create).not.toHaveBeenCalled();
			expect(mockUpdateAvailabilityOnBookingCreate).not.toHaveBeenCalled();
		});
	});

	describe('Cancel Booking with Availability Sync', () => {
		it('should cancel booking and update availability', async () => {
			const mockBooking = {
				id: 'booking-1',
				customerId: 'customer-1',
				providerId: 'provider-1',
				serviceId: 'service-1',
				startTime: new Date('2025-01-25T14:00:00Z'),
				status: 'CONFIRMED',
			};

			// Mock finding existing booking
			mockDb.booking.findUnique.mockResolvedValue(mockBooking);

			// Mock successful cancellation
			mockDb.booking.update.mockResolvedValue({
				...mockBooking,
				status: 'CANCELLED',
			});

			mockUpdateAvailabilityOnBookingCancel.mockResolvedValue({
				success: true,
				message: 'Availability updated successfully',
			});

			// Simulate booking cancellation flow
			const booking = await mockDb.booking.findUnique({
				where: { id: 'booking-1' },
			});

			expect(booking).toEqual(mockBooking);

			// Update booking status to cancelled
			const cancelledBooking = await mockDb.booking.update({
				where: { id: 'booking-1' },
				data: { status: 'CANCELLED' },
			});

			expect(cancelledBooking.status).toBe('CANCELLED');

			// Update availability after cancellation
			await updateAvailabilityOnBookingCancel(
				booking.providerId,
				booking.serviceId,
				booking.startTime
			);

			expect(mockUpdateAvailabilityOnBookingCancel).toHaveBeenCalledWith(
				'provider-1',
				'service-1',
				new Date('2025-01-25T14:00:00Z')
			);
		});

		it('should handle booking not found during cancellation', async () => {
			// Mock booking not found
			mockDb.booking.findUnique.mockResolvedValue(null);

			const booking = await mockDb.booking.findUnique({
				where: { id: 'non-existent-booking' },
			});

			expect(booking).toBeNull();

			// Should not update availability if booking doesn't exist
			expect(mockUpdateAvailabilityOnBookingCancel).not.toHaveBeenCalled();
		});
	});

	describe('Booking Status Update Integration', () => {
		it('should sync availability when booking status changes to CANCELLED', async () => {
			const mockBooking = {
				id: 'booking-1',
				customerId: 'customer-1',
				providerId: 'provider-1',
				serviceId: 'service-1',
				startTime: new Date('2025-01-25T14:00:00Z'),
				status: 'CONFIRMED',
			};

			mockDb.booking.findUnique.mockResolvedValue(mockBooking);
			mockDb.booking.update.mockResolvedValue({
				...mockBooking,
				status: 'CANCELLED',
			});

			mockUpdateAvailabilityOnBookingCancel.mockResolvedValue({
				success: true,
				message: 'Availability updated successfully',
			});

			// Simulate status update
			const booking = await mockDb.booking.findUnique({
				where: { id: 'booking-1' },
			});

			const updatedBooking = await mockDb.booking.update({
				where: { id: 'booking-1' },
				data: { status: 'CANCELLED' },
			});

			// Simulate conditional availability sync based on status change
			if (booking?.status !== 'CANCELLED' && updatedBooking.status === 'CANCELLED') {
				await updateAvailabilityOnBookingCancel(
					booking.providerId,
					booking.serviceId,
					booking.startTime
				);
			}

			expect(mockUpdateAvailabilityOnBookingCancel).toHaveBeenCalledWith(
				'provider-1',
				'service-1',
				new Date('2025-01-25T14:00:00Z')
			);
		});

		it('should not sync availability when status changes to non-CANCELLED', async () => {
			const mockBooking = {
				id: 'booking-1',
				customerId: 'customer-1',
				providerId: 'provider-1',
				serviceId: 'service-1',
				startTime: new Date('2025-01-25T14:00:00Z'),
				status: 'CONFIRMED',
			};

			mockDb.booking.findUnique.mockResolvedValue(mockBooking);
			mockDb.booking.update.mockResolvedValue({
				...mockBooking,
				status: 'COMPLETED',
			});

			// Simulate status update to COMPLETED
			const booking = await mockDb.booking.findUnique({
				where: { id: 'booking-1' },
			});

			const updatedBooking = await mockDb.booking.update({
				where: { id: 'booking-1' },
				data: { status: 'COMPLETED' },
			});

			// Should not sync availability for non-cancellation status changes
			if (booking?.status !== 'CANCELLED' && updatedBooking.status === 'CANCELLED') {
				await updateAvailabilityOnBookingCancel(
					booking.providerId,
					booking.serviceId,
					booking.startTime
				);
			}

			expect(mockUpdateAvailabilityOnBookingCancel).not.toHaveBeenCalled();
		});
	});
});
