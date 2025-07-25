import { apiClient } from "../shared/lib/api-client";
import type {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  PaymentProvider,
} from "./types";

export const paymentsApi = {
  /**
   * Initiate a payment for a booking (Enhanced)
   */
  initiatePayment: async (data: PaymentInitiationRequest): Promise<PaymentInitiationResponse> => {
    const response = await apiClient.payments["enhanced"]["initiate"].$post({
      json: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to initiate payment" }));
      throw new Error(errorData.message || "Failed to initiate payment");
    }

    return response.json();
  },

  /**
   * Verify a payment transaction (Enhanced)
   */
  verifyPayment: async (data: PaymentVerificationRequest): Promise<PaymentVerificationResponse> => {
    const response = await apiClient.payments["enhanced"]["verify"].$post({
      json: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to verify payment" }));
      throw new Error(errorData.message || "Failed to verify payment");
    }

    return response.json();
  },

  /**
   * Get payment status for a booking
   */
  getPaymentStatus: async (bookingId: string) => {
    const response = await apiClient.payments.status[":bookingId"].$get({
      param: { bookingId },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get payment status: ${error}`);
    }

    return response.json();
  },

  /**
   * Get available payment methods
   */
  getPaymentMethods: async (): Promise<PaymentProvider[]> => {
    const response = await apiClient.payments.methods.$get();

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get payment methods: ${error}`);
    }

    const data = await response.json();
    return data.methods;
  },
};
