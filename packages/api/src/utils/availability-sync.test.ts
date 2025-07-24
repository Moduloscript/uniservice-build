import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { PrismaClient } from '@repo/database';

// Mock the database import
vi.mock('@repo/database', () => ({
	db: {
		providerAvailability: {
			findFirst: vi.fn(),
			update: vi.fn(),
		},
	} as unknown as PrismaClient,
}));

// Import after mocking
import { 
	updateAvailabilityOnBookingCreate, 
	updateAvailabilityOnBookingCancel,
	validateBookingAvailability 
} from './availability-sync';
import { db } from '@repo/database';

const mockDb = db as any;

describe('Availability Sync Functions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('updateAvailabilityOnBookingCreate', () => {
		it('should update availability when booking is created', async () => {
			// Mock availability slot with capacity
			const mockSlot = {
				id: 'slot-1',
				currentBookings: 1,
				maxBookings: 3,
				isAvailable: true,
				isBooked: false,
			};

			(mockDb.providerAvailability.findFirst as any).mockResolvedValue(mockSlot);
			(mockDb.providerAvailability.update as any).mockResolvedValue({
				...mockSlot,
				currentBookings: 2,
			});

			const result = await updateAvailabilityOnBookingCreate(
				'provider-1',
				'service-1',
				new Date('2025-01-25T14:00:00Z')
			);

			expect(result.success).toBe(true);
			expect(result.message).toContain('2/3 bookings');

			// Verify update was called correctly
			expect(mockDb.providerAvailability.update).toHaveBeenCalledWith({
				where: { id: 'slot-1' },
				data: {
					currentBookings: 2,
					isBooked: false,
					isAvailable: true,
				},
			});
		});

		it('should mark slot as booked when at maximum capacity', async () => {
			// Mock availability slot at near capacity
			const mockSlot = {
				id: 'slot-1',
				currentBookings: 2,
				maxBookings: 3,
				isAvailable: true,
				isBooked: false,
			};

			(mockDb.providerAvailability.findFirst as any).mockResolvedValue(mockSlot);

			await updateAvailabilityOnBookingCreate(
				'provider-1',
				'service-1',
				new Date('2025-01-25T14:00:00Z')
			);

			// Should mark as booked when at max capacity
			expect(mockDb.providerAvailability.update).toHaveBeenCalledWith({
				where: { id: 'slot-1' },
				data: {
					currentBookings: 3,
					isBooked: true,
					isAvailable: false,
				},
			});
		});

		it('should handle case when no availability slot exists', async () => {
			(mockDb.providerAvailability.findFirst as any).mockResolvedValue(null);

			const result = await updateAvailabilityOnBookingCreate(
				'provider-1',
				'service-1',
				new Date('2025-01-25T14:00:00Z')
			);

			expect(result.success).toBe(true);
			expect(result.message).toContain('No matching availability slot found');
			expect(mockDb.providerAvailability.update).not.toHaveBeenCalled();
		});

		it('should prevent booking when slot is at maximum capacity', async () => {
			// Mock availability slot at maximum capacity
			const mockSlot = {
				id: 'slot-1',
				currentBookings: 3,
				maxBookings: 3,
				isAvailable: false,
				isBooked: true,
			};

			(mockDb.providerAvailability.findFirst as any).mockResolvedValue(mockSlot);

			const result = await updateAvailabilityOnBookingCreate(
				'provider-1',
				'service-1',
				new Date('2025-01-25T14:00:00Z')
			);

			expect(result.success).toBe(false);
			expect(result.message).toContain('maximum capacity');
			expect(mockDb.providerAvailability.update).not.toHaveBeenCalled();
		});
	});

	describe('updateAvailabilityOnBookingCancel', () => {
		it('should update availability when booking is cancelled', async () => {
			// Mock availability slot with bookings
			const mockSlot = {
				id: 'slot-1',
				currentBookings: 2,
				maxBookings: 3,
				isAvailable: false,
				isBooked: true,
			};

			(mockDb.providerAvailability.findFirst as any).mockResolvedValue(mockSlot);

			const result = await updateAvailabilityOnBookingCancel(
				'provider-1',
				'service-1',
				new Date('2025-01-25T14:00:00Z')
			);

			expect(result.success).toBe(true);
			expect(result.message).toContain('1/3 bookings');

			// Should mark as available when below max capacity
			expect(mockDb.providerAvailability.update).toHaveBeenCalledWith({
				where: { id: 'slot-1' },
				data: {
					currentBookings: 1,
					isBooked: false,
					isAvailable: true,
				},
			});
		});

		it('should not allow negative current bookings', async () => {
			// Mock availability slot with 0 bookings
			const mockSlot = {
				id: 'slot-1',
				currentBookings: 0,
				maxBookings: 3,
				isAvailable: true,
				isBooked: false,
			};

			(mockDb.providerAvailability.findFirst as any).mockResolvedValue(mockSlot);

			await updateAvailabilityOnBookingCancel(
				'provider-1',
				'service-1',
				new Date('2025-01-25T14:00:00Z')
			);

			// Should keep currentBookings at 0, not go negative
			expect(mockDb.providerAvailability.update).toHaveBeenCalledWith({
				where: { id: 'slot-1' },
				data: {
					currentBookings: 0,
					isBooked: false,
					isAvailable: true,
				},
			});
		});
	});

	describe('validateBookingAvailability', () => {
		it('should validate availability for booking', async () => {
			// Mock available slot
			const mockSlot = {
				id: 'slot-1',
				currentBookings: 1,
				maxBookings: 3,
				isAvailable: true,
				isBooked: false,
			};

			(mockDb.providerAvailability.findFirst as any).mockResolvedValue(mockSlot);

			const result = await validateBookingAvailability(
				'provider-1',
				'service-1',
				new Date('2025-01-25T14:00:00Z')
			);

			expect(result.isValid).toBe(true);
			expect(result.message).toContain('available for booking');
			expect(result.availabilitySlot).toEqual(mockSlot);
		});

		it('should reject booking when no slot available', async () => {
			(mockDb.providerAvailability.findFirst as any).mockResolvedValue(null);

			const result = await validateBookingAvailability(
				'provider-1',
				'service-1',
				new Date('2025-01-25T14:00:00Z')
			);

			expect(result.isValid).toBe(false);
			expect(result.message).toContain('No available time slot');
		});

		it('should reject booking when slot is full', async () => {
			// Mock full slot
			const mockSlot = {
				id: 'slot-1',
				currentBookings: 3,
				maxBookings: 3,
				isAvailable: false,
				isBooked: true,
			};

			(mockDb.providerAvailability.findFirst as any).mockResolvedValue(mockSlot);

			const result = await validateBookingAvailability(
				'provider-1',
				'service-1',
				new Date('2025-01-25T14:00:00Z')
			);

			expect(result.isValid).toBe(false);
			expect(result.message).toContain('fully booked');
		});
	});
});
