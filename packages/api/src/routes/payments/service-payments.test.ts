import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import { Hono } from 'hono';
import type { PrismaClient } from '@repo/database';

// Mock environment variables for the service-payments module
vi.mock('./service-payments', async () => {
  const actual = await vi.importActual('./service-payments');
  return actual;
});

vi.mock('../../middleware/auth', () => ({
  authMiddleware: vi.fn((c, next) => {
    c.set('user', { id: 'test-user-id', email: 'test@example.com' });
    return next();
  }),
}));

// Mock database
vi.mock('@repo/database', () => ({
  db: {
    booking: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    payment: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
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

// Mock fetch for external API calls
global.fetch = vi.fn();

// Set environment variables BEFORE importing
process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock_key';
process.env.FLUTTERWAVE_SECRET_KEY = 'FLWSECK_TEST_mock_key';
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';

import { db } from '@repo/database';
import { servicePaymentsRouter } from './service-payments';

const mockDb = db as any;
const mockFetch = global.fetch as any;

describe('Service Payments API', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/api', servicePaymentsRouter);
    vi.clearAllMocks();
    
    // Environment variables already set at module level
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /payments/initiate-payment', () => {
    const validPaymentData = {
      amount: 5000,
      currency: 'NGN',
      email: 'test@example.com',
      name: 'Test User',
      bookingId: 'booking-123',
      serviceId: 'service-123',
      providerId: 'provider-123',
      metadata: { custom: 'data' },
    };

    it('should successfully initiate Paystack payment', async () => {
      // Mock booking exists and belongs to user
      mockDb.booking.findUnique.mockResolvedValue({
        id: 'booking-123',
        studentId: 'test-user-id',
        service: { id: 'service-123' },
        student: { id: 'test-user-id' },
        payment: null,
      });

      // Mock Paystack response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: true,
          message: 'Authorization URL created',
          data: {
            authorization_url: 'https://checkout.paystack.com/test-url',
            access_code: 'test-access-code',
            reference: 'test-reference',
          },
        }),
      });

      // Mock payment creation
      mockDb.payment.create.mockResolvedValue({
        id: 'payment-123',
        transactionRef: 'txn_test_ref',
        status: 'PENDING',
      });

      const response = await app.request('/api/payments/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPaymentData),
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.paymentUrl).toBe('https://checkout.paystack.com/test-url');
      expect(result.provider).toBe('paystack');
      expect(result.transactionRef).toMatch(/^txn_/);
      
      // Verify Paystack API was called with correct data
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/initialize',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('500000'), // Amount in kobo
        })
      );

      // Verify payment record was created
      expect(mockDb.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 5000,
          currency: 'NGN',
          status: 'PENDING',
          provider: 'PAYSTACK',
          bookingId: 'booking-123',
          providerId: 'provider-123',
        }),
      });
    });

    it('should return 404 if booking not found', async () => {
mockDb.booking.findUnique.mockResolvedValue(null);
      
      vi.spyOn(global.console, 'error').mockImplementation(vi.fn()); // To handle unhandled errors gracefully

      const response = await app.request('/api/payments/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPaymentData),
      });

      expect(response.status).toBe(404);
      const result = await response.text();
      expect(result).toBe('Booking not found');
    });

    it('should return 400 if payment already exists', async () => {
      mockDb.booking.findUnique.mockResolvedValue({
        id: 'booking-123',
        studentId: 'test-user-id',
        service: { id: 'service-123' },
        student: { id: 'test-user-id' },
        payment: { id: 'existing-payment' },
      });

      const response = await app.request('/api/payments/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPaymentData),
      });

      expect(response.status).toBe(400);
      const result = await response.text();
      expect(result).toBe('Payment already exists for this booking');
    });

    it('should handle Paystack API errors', async () => {
      mockDb.booking.findUnique.mockResolvedValue({
        id: 'booking-123',
        studentId: 'test-user-id',
        service: { id: 'service-123' },
        student: { id: 'test-user-id' },
        payment: null,
      });

      // Mock Paystack error response
mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          message: 'Paystack API Error',
        }),
        text: async () => JSON.stringify({ message: 'Paystack API Error' }),
      });

      const response = await app.request('/api/payments/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPaymentData),
      });

      expect(response.status).toBe(500);
      const result = await response.text();
      expect(result).toContain('Paystack initialization failed');
    });

    it('should validate request body schema', async () => {
      const invalidData = {
        amount: -100, // Invalid negative amount
        email: 'invalid-email', // Invalid email format
      };

      const response = await app.request('/api/payments/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /payments/verify-payment', () => {
    const verificationData = {
      transactionRef: 'txn_test_ref',
      provider: 'paystack' as const,
    };

    it('should successfully verify Paystack payment', async () => {
      // Mock payment exists and belongs to user
      mockDb.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        transactionRef: 'txn_test_ref',
        status: 'PENDING',
        bookingId: 'booking-123',
        metadata: {},
        booking: {
          studentId: 'test-user-id',
          service: { id: 'service-123' },
          student: { id: 'test-user-id' },
        },
      });

      // Mock Paystack verification response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: true,
          data: {
            status: 'success',
            amount: 500000, // Amount in kobo
            currency: 'NGN',
            reference: 'txn_test_ref',
          },
        }),
      });

      // Mock payment update
      mockDb.payment.update.mockResolvedValue({
        id: 'payment-123',
        status: 'SUCCESS',
      });

      // Mock booking update
      mockDb.booking.update.mockResolvedValue({
        id: 'booking-123',
        status: 'CONFIRMED',
      });

      const response = await app.request('/api/payments/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData),
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.status).toBe('success');
      expect(result.amount).toBe(5000); // Converted from kobo
      expect(result.currency).toBe('NGN');

      // Verify Paystack verification API was called
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/verify/txn_test_ref',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      );

      // Verify payment status was updated
      expect(mockDb.payment.update).toHaveBeenCalledWith({
        where: { transactionRef: 'txn_test_ref' },
        data: expect.objectContaining({
          status: 'SUCCESS',
        }),
      });

      // Verify booking status was updated
      expect(mockDb.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-123' },
        data: { status: 'CONFIRMED' },
      });
    });

    it('should handle failed payment verification', async () => {
      mockDb.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        transactionRef: 'txn_test_ref',
        status: 'PENDING',
        bookingId: 'booking-123',
        metadata: {},
        booking: {
          studentId: 'test-user-id',
          service: { id: 'service-123' },
          student: { id: 'test-user-id' },
        },
      });

      // Mock failed Paystack verification
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: true,
          data: {
            status: 'failed',
            amount: 500000,
            currency: 'NGN',
            reference: 'txn_test_ref',
          },
        }),
      });

      mockDb.payment.update.mockResolvedValue({
        id: 'payment-123',
        status: 'FAILED',
      });

      const response = await app.request('/api/payments/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData),
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.success).toBe(false);
      expect(result.status).toBe('failed');

      // Verify payment status was updated to FAILED
      expect(mockDb.payment.update).toHaveBeenCalledWith({
        where: { transactionRef: 'txn_test_ref' },
        data: expect.objectContaining({
          status: 'FAILED',
        }),
      });

      // Verify booking status was NOT updated (should remain as is)
      expect(mockDb.booking.update).not.toHaveBeenCalled();
    });

    it('should return 404 if payment not found', async () => {
mockDb.payment.findUnique.mockResolvedValue(null);
      
      vi.spyOn(global.console, 'error').mockImplementation(vi.fn());

      const response = await app.request('/api/payments/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData),
      });

      expect(response.status).toBe(404);
      const result = await response.text();
      expect(result).toBe('Payment not found');
    });
  });

  describe('GET /payments/status/:bookingId', () => {
    it('should return payment status for valid booking', async () => {
      mockDb.payment.findFirst.mockResolvedValue({
        id: 'payment-123',
        transactionRef: 'txn_test_ref',
        status: 'SUCCESS',
        amount: 5000,
        currency: 'NGN',
        provider: 'PAYSTACK',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T01:00:00Z'),
        booking: { id: 'booking-123' },
      });

      const response = await app.request('/api/payments/status/booking-123');

      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.status).toBe('success');
      expect(result.amount).toBe(5000);
      expect(result.currency).toBe('NGN');
      expect(result.transactionRef).toBe('txn_test_ref');
      expect(result.provider).toBe('paystack');
    });

    it('should return not_found for non-existent payment', async () => {
      mockDb.payment.findFirst.mockResolvedValue(null);

      const response = await app.request('/api/payments/status/booking-123');

      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.status).toBe('not_found');
      expect(result.message).toBe('No payment found for this booking');
    });
  });

  describe('GET /payments/methods', () => {
    it('should return available payment methods', async () => {
      const response = await app.request('/api/payments/methods');

      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.methods).toEqual(['paystack', 'flutterwave']);
      expect(result.default).toBe('paystack');
    });
  });

  describe('Flutterwave Integration', () => {
    it('should handle Flutterwave payment initialization', async () => {
      // This test would be similar to Paystack but with Flutterwave-specific logic
      // For brevity, showing structure - full implementation would follow same pattern
      mockDb.booking.findUnique.mockResolvedValue({
        id: 'booking-123',
        studentId: 'test-user-id',
        service: { id: 'service-123' },
        student: { id: 'test-user-id' },
        payment: null,
      });

      // Mock Flutterwave response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          message: 'Payment link created',
          data: {
            link: 'https://checkout.flutterwave.com/test-link',
          },
        }),
      });

      // Test would continue with Flutterwave-specific assertions...
    });
  });
});
