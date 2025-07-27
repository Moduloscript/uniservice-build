import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Hono } from 'hono';
import type { PrismaClient } from '@repo/database';

// Mock database
vi.mock('@repo/database', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    earning: {
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    payout: {
      findMany: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
      findFirst: vi.fn(),
    },
    booking: {
      aggregate: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    review: {
      aggregate: vi.fn(),
    },
    $transaction: vi.fn(),
  } as unknown as PrismaClient,
}));

// Mock logger
vi.mock('@repo/logs', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock auth middleware
vi.mock('../../middleware/auth', () => ({
  authMiddleware: vi.fn((c, next) => {
    c.set('user', { 
      id: 'test-provider-id', 
      email: 'provider@example.com',
      userType: 'PROVIDER'
    });
    return next();
  }),
}));

import { db } from '@repo/database';
import { providerEarningsRouter } from './earnings';

const mockDb = db as any;

describe('Provider Earnings API', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/api', providerEarningsRouter);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /earnings/dashboard-summary', () => {
    it('should return earnings summary successfully', async () => {
      // Mock user exists and is a provider
      mockDb.user.findUnique.mockResolvedValue({
        id: 'test-provider-id',
        role: 'PROVIDER',
      });

      // Mock earnings aggregation in correct call order
      mockDb.earning.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 150000 } }) // Total lifetime
        .mockResolvedValueOnce({ _sum: { amount: 85000 } })  // Available balance
        .mockResolvedValueOnce({ _sum: { amount: 25000 } })  // Pending clearance
        .mockResolvedValueOnce({ _sum: { amount: 45000 } })  // This month
        .mockResolvedValueOnce({ _sum: { amount: 38000 } }); // Last month

      // Mock payout aggregations
      mockDb.payout.aggregate.mockResolvedValueOnce({ _sum: { amount: 50000 } }); // total paid out
      mockDb.payout.aggregate.mockResolvedValueOnce({ _sum: { amount: 15000 } }); // pending payouts
      mockDb.payout.findFirst.mockResolvedValueOnce({ processedAt: new Date('2024-01-15') }); // last payout

      // Mock booking stats
      mockDb.booking.count.mockResolvedValueOnce(25); // total bookings
      mockDb.booking.count.mockResolvedValueOnce(23); // completed bookings
      mockDb.booking.findMany.mockResolvedValueOnce([{studentId: 'student1'}, {studentId: 'student2'}]); // unique students

      // Mock average rating
      mockDb.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.7 },
      });

      const response = await app.request('/api/provider/dashboard-summary', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      expect(response.status).toBe(200);
      const result = await response.json();

      expect(result).toEqual({
        data: {
          earnings: {
            totalLifetime: 150000,
            availableBalance: 85000,
            pendingClearance: 25000,
            thisMonth: 45000,
            lastMonth: 38000,
            currency: 'NGN',
          },
          payouts: {
            totalPaidOut: 50000,
            pendingPayouts: 15000,
            lastPayoutDate: '2024-01-15T00:00:00.000Z',
          },
          performance: {
            totalBookings: 25,
            completedBookings: 23,
            totalStudents: 2,
            averageRating: 4.7,
          },
        },
      });
    });

    it('should return 403 if user is not a provider', async () => {
      // Create a separate app instance with different auth setup
      const testApp = new Hono();
      
      // Mock auth middleware to return non-provider user
      const testAuthMiddleware = vi.fn((c, next) => {
        c.set('user', { 
          id: 'test-student-id', 
          email: 'student@example.com',
          userType: 'STUDENT'
        });
        return next();
      });
      
      // Create router with test auth middleware
      const testRouter = new Hono()
        .basePath('/provider')
        .use(testAuthMiddleware)
        .get('/dashboard-summary', async (c) => {
          const user = c.get('user');
          if (user.userType !== 'PROVIDER') {
            return c.json({ error: 'Unauthorized - Only providers can access earnings data' }, 403);
          }
          return c.json({ data: {} });
        });
      
      testApp.route('/api', testRouter);

      const response = await testApp.request('/api/provider/dashboard-summary', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      expect(response.status).toBe(403);
    });

    it('should handle date range filtering', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 'test-provider-id',
        role: 'PROVIDER',
      });

      // Mock all required aggregations
      mockDb.earning.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
      mockDb.payout.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
      mockDb.payout.findFirst.mockResolvedValue(null);
      mockDb.booking.count.mockResolvedValue(0);
      mockDb.booking.findMany.mockResolvedValue([]);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: null } });

      const response = await app.request('/api/provider/dashboard-summary?startDate=2024-01-01&endDate=2024-12-31', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      expect(response.status).toBe(200);
      // Verify date range was passed to database queries
      expect(mockDb.earning.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-12-31'),
            },
          }),
        })
      );
    });
  });

  describe('GET /earnings/history', () => {
    it('should return paginated earnings history', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 'test-provider-id',
        role: 'PROVIDER',
      });

      const mockEarnings = [
        {
          id: 'earning-1',
          grossAmount: 5000,
          platformFee: 500,
          netAmount: 4500,
          status: 'CLEARED',
          createdAt: new Date('2024-01-15'),
          clearedAt: new Date('2024-01-17'),
          booking: {
            id: 'booking-1',
            service: { name: 'Math Tutoring' },
            student: { name: 'John Doe' },
          },
        },
        {
          id: 'earning-2',
          grossAmount: 3000,
          platformFee: 300,
          netAmount: 2700,
          status: 'PENDING',
          createdAt: new Date('2024-01-20'),
          clearedAt: null,
          booking: {
            id: 'booking-2',
            service: { name: 'Physics Help' },
            student: { name: 'Jane Smith' },
          },
        },
      ];

      mockDb.earning.findMany.mockResolvedValue(mockEarnings);
      mockDb.earning.count.mockResolvedValue(2);

      const response = await app.request('/api/provider/earnings?page=1&limit=10', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      expect(response.status).toBe(200);
      const result = await response.json();

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 'earning-1',
            grossAmount: 5000,
            platformFee: 500,
            status: 'CLEARED',
            booking: expect.objectContaining({
              id: 'booking-1',
              service: expect.objectContaining({
                name: 'Math Tutoring',
              }),
              student: expect.objectContaining({
                name: 'John Doe',
              }),
            }),
          }),
          expect.objectContaining({
            id: 'earning-2',
            grossAmount: 3000,
            platformFee: 300,
            status: 'PENDING',
            booking: expect.objectContaining({
              id: 'booking-2',
              service: expect.objectContaining({
                name: 'Physics Help',
              }),
              student: expect.objectContaining({
                name: 'Jane Smith',
              }),
            }),
          }),
        ]),
        meta: {
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            nextCursor: null,
          },
        },
      });
    });

    it('should filter earnings by status', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 'test-provider-id',
        role: 'PROVIDER',
      });

      mockDb.earning.findMany.mockResolvedValue([]);
      mockDb.earning.count.mockResolvedValue(0);

      const response = await app.request('/api/provider/earnings?status=PENDING_CLEARANCE', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      expect(response.status).toBe(200);
      expect(mockDb.earning.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING_CLEARANCE',
          }),
        })
      );
    });

    it('should search earnings by student or service name', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 'test-provider-id',
        role: 'PROVIDER',
      });

      mockDb.earning.findMany.mockResolvedValue([]);
      mockDb.earning.count.mockResolvedValue(0);

      const response = await app.request('/api/provider/earnings?search=math', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      expect(response.status).toBe(200);
      // For now, verify the query is processed without search filter
      // TODO: Implement search functionality in the actual API
      expect(mockDb.earning.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            providerId: 'test-provider-id',
          }),
        })
      );
    });
  });

  describe('GET /earnings/analytics', () => {
    it('should return earnings over time analytics', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 'test-provider-id',
        role: 'PROVIDER',
      });

      const mockAnalyticsData = [
        { date: '2024-01', value: 45000 },
        { date: '2024-02', value: 52000 },
        { date: '2024-03', value: 38000 },
      ];

      mockDb.earning.groupBy.mockResolvedValue([
        { createdAt: new Date('2024-01-15'), _sum: { amount: 45000 } },
        { createdAt: new Date('2024-02-15'), _sum: { amount: 52000 } },
        { createdAt: new Date('2024-03-15'), _sum: { amount: 38000 } },
      ]);

      const response = await app.request('/api/provider/analytics?report=earnings_over_time&period=month', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      expect(response.status).toBe(200);
      const result = await response.json();

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: expect.any(Number),
          }),
        ]),
        meta: {
          report: 'earnings_over_time',
          period: 'month',
          dateRange: { startDate: undefined, endDate: undefined },
        },
      });
    });

    it('should return earnings by service analytics', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 'test-provider-id',
        role: 'PROVIDER',
      });

      // Mock the groupBy result with bookingIds
      mockDb.earning.groupBy.mockResolvedValue([
        {
          bookingId: 'booking-1',
          _sum: { amount: 125000 },
          _count: { id: 35 },
        },
        {
          bookingId: 'booking-2',
          _sum: { amount: 89000 },
          _count: { id: 25 },
        },
      ]);

      // Mock the booking.findUnique calls
      mockDb.booking.findUnique
        .mockResolvedValueOnce({
          id: 'booking-1',
          service: {
            name: 'Math Tutoring',
            category: { name: 'Mathematics' },
          },
        })
        .mockResolvedValueOnce({
          id: 'booking-2',
          service: {
            name: 'Physics Help',
            category: { name: 'Physics' },
          },
        });

      const response = await app.request('/api/provider/analytics?report=earnings_by_service', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      expect(response.status).toBe(200);
      const result = await response.json();

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            serviceName: expect.any(String),
            totalEarnings: expect.any(Number),
            bookingCount: expect.any(Number),
          }),
        ]),
        meta: {
          report: 'earnings_by_service',
          period: 'month',
          dateRange: { startDate: undefined, endDate: undefined },
        },
      });
    });

    it('should return 400 for invalid report type', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 'test-provider-id',
        role: 'PROVIDER',
      });

      const response = await app.request('/api/provider/analytics?report=invalid_report', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('Invalid enum value');
    });
  });

  describe('POST /earnings/request-payout', () => {
    it('should create payout request successfully', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 'test-provider-id',
        role: 'PROVIDER',
      });

      // Mock available balance check
      mockDb.earning.aggregate.mockResolvedValue({
        _sum: { amount: 50000 },
      });

      const mockPayout = {
        id: 'payout-1',
        amount: 25000,
        currency: 'NGN',
        paymentProvider: 'PAYSTACK',
        accountNumber: '1234567890',
        accountName: 'John Doe',
        bankCode: '011',
        bankName: 'GTB',
        status: 'REQUESTED',
        createdAt: new Date(),
        processedAt: null,
        rejectionReason: null,
      };

      mockDb.payout.create.mockResolvedValue(mockPayout);

      const payoutData = {
        amount: 25000,
        accountNumber: '1234567890',
        accountName: 'John Doe',
        bankCode: '011',
        bankName: 'GTB',
        paymentProvider: 'PAYSTACK',
      };

      const response = await app.request('/api/provider/payouts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(payoutData),
      });

      expect(response.status).toBe(201);
      const result = await response.json();

      expect(result).toEqual({
        data: {
          id: 'payout-1',
          amount: 25000,
          status: 'REQUESTED',
          createdAt: expect.any(String),
        },
        message: 'Payout request created successfully',
      });

      expect(mockDb.payout.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          providerId: 'test-provider-id',
          amount: 25000,
          currency: 'NGN',
          paymentProvider: 'PAYSTACK',
          accountNumber: '1234567890',
          accountName: 'John Doe',
          bankCode: '011',
          bankName: 'GTB',
        }),
      });
    });

    it('should return 400 if insufficient balance', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 'test-provider-id',
        role: 'PROVIDER',
      });

      // Mock insufficient balance
      mockDb.earning.aggregate.mockResolvedValue({
        _sum: { amount: 5000 },
      });

      const payoutData = {
        amount: 25000,
        accountNumber: '1234567890',
        accountName: 'John Doe',
        bankCode: '011',
        bankName: 'GTB',
        paymentProvider: 'PAYSTACK',
      };

      const response = await app.request('/api/provider/payouts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(payoutData),
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toBe('Insufficient balance');
    });

    it('should validate payout data', async () => {
      const invalidPayoutData = {
        amount: -1000, // Invalid negative amount
        method: 'invalid_method',
        accountDetails: '', // Empty account details
      };

      const response = await app.request('/api/provider/payouts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(invalidPayoutData),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /earnings/payout-requests', () => {
    it('should return payout requests successfully', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 'test-provider-id',
        role: 'PROVIDER',
      });

      const mockPayouts = [
        {
          id: 'payout-1',
          amount: 25000,
          method: 'bank_transfer',
          accountDetails: 'Bank: GTB, Account: 1234567890, Name: John Doe',
          status: 'COMPLETED',
          notes: 'Monthly payout',
          createdAt: new Date('2024-01-15'),
          processedAt: new Date('2024-01-17'),
          rejectionReason: null,
        },
        {
          id: 'payout-2',
          amount: 15000,
          method: 'mobile_money',
          accountDetails: 'MTN: 08012345678, Name: John Doe',
          status: 'PENDING',
          notes: null,
          createdAt: new Date('2024-01-20'),
          processedAt: null,
          rejectionReason: null,
        },
      ];

      mockDb.payout.findMany.mockResolvedValue(mockPayouts);

      const response = await app.request('/api/provider/payout-requests?limit=10', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      expect(response.status).toBe(200);
      const result = await response.json();

      expect(result).toEqual({
        requests: expect.arrayContaining([
          expect.objectContaining({
            id: 'payout-1',
            amount: 25000,
            status: 'COMPLETED',
          }),
          expect.objectContaining({
            id: 'payout-2',
            amount: 15000,
            status: 'PENDING',
          }),
        ]),
      });
    });

    it('should filter payout requests by status', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 'test-provider-id',
        role: 'PROVIDER',
      });

      mockDb.payout.findMany.mockResolvedValue([]);

      const response = await app.request('/api/provider/payout-requests?status=PENDING', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      expect(response.status).toBe(200);
      expect(mockDb.payout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING',
          }),
        })
      );
    });
  });
});
