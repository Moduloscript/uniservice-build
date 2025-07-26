import type {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  PaymentProvider,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * Real payment API integration with backend
 */
export const paymentsApi = {
  /**
   * Initiate a payment for a booking
   */
  initiatePayment: async (data: PaymentInitiationRequest): Promise<PaymentInitiationResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        bookingId: data.bookingId,
        redirectUrl: `${window.location.origin}/payments/verify`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to initialize payment");
    }

    const result = await response.json();
    return {
      success: result.success,
      paymentUrl: result.data.paymentUrl,
      transactionRef: result.data.transactionRef,
      provider: 'flutterwave' as PaymentProvider,
      fees: result.data.amount - data.amount, // Calculate fees from difference
    };
  },

  /**
   * Verify a payment transaction
   */
  verifyPayment: async (data: PaymentVerificationRequest): Promise<PaymentVerificationResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/verify/${data.transactionRef}`, {
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

    const result = await response.json();
    return {
      success: result.success,
      status: result.data.status.toLowerCase() as any,
      amount: result.data.amount,
      currency: result.data.currency,
      transactionRef: result.data.transactionRef,
      provider: data.provider,
      paidAt: result.data.paidAt,
      booking: result.data.booking,
    };
  },

  /**
   * Get payment status for a booking
   */
  getPaymentStatus: async (bookingId: string) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get payment status");
    }

    return response.json();
  },

  /**
   * Get available payment methods
   */
  getPaymentMethods: async (): Promise<PaymentProvider[]> => {
    // Return both providers as available
    return ['paystack', 'flutterwave'] as PaymentProvider[];
  },
};
