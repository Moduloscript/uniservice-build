# Payment Integration Setup Guide

## Overview

The UnibenServices platform now supports secure payment processing for service bookings through two major Nigerian payment providers:

- **Paystack** (Primary)
- **Flutterwave** (Secondary)

## Environment Configuration

Add the following environment variables to your `.env.local` file:

```bash
# Paystack Configuration
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here

# Flutterwave Configuration  
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your_flutterwave_public_key_here
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your_flutterwave_secret_key_here
```

**Note:** The application already uses `NEXT_PUBLIC_SITE_URL` for the base URL configuration.

## Payment Flow

### 1. Booking Creation
- Student selects a service and time slot
- A booking record is created with `PENDING` status
- Student proceeds to payment method selection

### 2. Payment Method Selection
- Student chooses between Paystack or Flutterwave
- Payment fees are calculated and displayed
- Total amount (service price + fees) is shown

### 3. Payment Processing
- Payment URL is generated using the selected provider
- Student is redirected to secure payment page
- Payment status is automatically verified via polling

### 4. Booking Confirmation
- On successful payment, booking status changes to `CONFIRMED`
- Student receives confirmation with booking details
- Provider is notified of the new booking

## Payment Fees

- **Paystack:** ₦100 + 1.5% of transaction amount
- **Flutterwave:** ₦50 + 1.4% of transaction amount

## API Endpoints

### POST `/api/payments/initiate-payment`
Initiates a payment for a booking.

**Request Body:**
```json
{
  "amount": 5000,
  "currency": "NGN",
  "email": "student@example.com",
  "name": "Student Name",
  "bookingId": "booking_id",
  "serviceId": "service_id",
  "providerId": "provider_id",
  "metadata": {}
}
```

### POST `/api/payments/verify-payment`
Verifies a payment transaction.

**Request Body:**
```json
{
  "transactionRef": "txn_12345",
  "provider": "paystack"
}
```

### GET `/api/payments/status/:bookingId`
Gets payment status for a booking.

### GET `/api/payments/methods`
Returns available payment methods.

## Security Features

- All payment communications are encrypted
- Transaction references are unique and secure
- User authentication is required for all payment operations
- Payment records are linked to verified bookings only

## Database Schema

The payment system uses these database models:

- `payment` - Stores payment transaction records
- `booking` - Updated with payment status
- Transaction references ensure payment-booking integrity

## Testing

For testing, use the test keys provided by Paystack and Flutterwave:

- Test transactions will not process real money
- Use test card numbers provided by each payment provider
- Verify payment flow works end-to-end

## Error Handling

The system handles:
- Payment provider timeouts
- Invalid payment methods
- Duplicate payments
- Booking verification failures
- Network connectivity issues

## Support

For payment-related issues:
1. Check payment status via the API
2. Verify environment variables are set correctly
3. Review payment provider dashboard for transaction details
4. Contact payment provider support if needed
