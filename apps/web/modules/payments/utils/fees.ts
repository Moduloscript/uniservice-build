import type { PaymentProvider } from "../types";

/**
 * Calculate payment fees for different providers
 * @param provider - Payment provider (paystack or flutterwave)
 * @param amount - Service amount in NGN
 * @returns Calculated fees in NGN
 */
export function calculatePaymentFees(provider: PaymentProvider, amount: number): number {
  switch (provider) {
    case "paystack":
      // Paystack fees: 1.5% with ₦100 minimum, capped at ₦2,000
      return Math.min(Math.max(100, amount * 0.015), 2000);
    case "flutterwave":
      // Flutterwave fees: 1.4% with ₦10 minimum
      return Math.max(10, amount * 0.014);
    default:
      return 0;
  }
}

/**
 * Calculate total amount including fees
 * @param provider - Payment provider
 * @param amount - Service amount in NGN
 * @returns Total amount including fees
 */
export function calculateTotalAmount(provider: PaymentProvider, amount: number): number {
  return amount + calculatePaymentFees(provider, amount);
}

/**
 * Format amount as Nigerian Naira currency
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatNairaAmount(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get fee description for display
 * @param provider - Payment provider
 * @returns Human-readable fee description
 */
export function getFeeDescription(provider: PaymentProvider): string {
  switch (provider) {
    case "paystack":
      return "1.5% (₦100 min, ₦2,000 max)";
    case "flutterwave":
      return "1.4% (₦10 minimum)";
    default:
      return "No fees";
  }
}
