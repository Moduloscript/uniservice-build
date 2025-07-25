# Enhanced Payment System Environment Variables

## Required Environment Variables

### Paystack Configuration (Primary Payment Provider)

```bash
# Paystack API Keys
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Application URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Webhook Configuration (for production)
PAYSTACK_WEBHOOK_URL=${NEXT_PUBLIC_SITE_URL}/api/webhooks/paystack
```

### Optional: Flutterwave Configuration (Secondary)

```bash
# Flutterwave API Keys (optional - currently disabled)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Environment Setup Instructions

### 1. Development Environment

1. **Get Paystack Test Keys:**
   - Sign up at [dashboard.paystack.com](https://dashboard.paystack.com)
   - Navigate to Settings > API Keys & Webhooks
   - Copy your test keys (they start with `pk_test_` and `sk_test_`)

2. **Update `.env.local`:**
   ```bash
   # Add to your .env.local file
   PAYSTACK_PUBLIC_KEY=pk_test_your_test_public_key_here
   PAYSTACK_SECRET_KEY=sk_test_your_test_secret_key_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Configure Webhook URL (for testing):**
   - Use ngrok or similar tool to expose localhost
   - Set webhook URL in Paystack dashboard to: `https://your-ngrok-url.ngrok.io/api/webhooks/paystack`

### 2. Production Environment

1. **Get Paystack Live Keys:**
   - Complete Paystack business verification
   - Switch to live mode in Paystack dashboard
   - Copy your live keys (they start with `pk_live_` and `sk_live_`)

2. **Update Production Environment:**
   ```bash
   PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key_here
   PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key_here
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

3. **Configure Production Webhook:**
   - Set webhook URL in Paystack dashboard to: `https://yourdomain.com/api/webhooks/paystack`
   - Ensure your production server accepts POST requests to this endpoint
   - Verify SSL certificate is valid

## Webhook Events Supported

The enhanced payment system handles these Paystack webhook events:

- `charge.success` - Payment completed successfully
- `charge.failed` - Payment failed
- `transfer.success` - Provider payout successful
- `transfer.failed` - Provider payout failed
- `transfer.reversed` - Provider payout reversed

## Security Features

### 1. Webhook Signature Verification
- All webhooks are verified using HMAC SHA512
- Invalid signatures are rejected automatically
- All webhook events are logged for audit

### 2. Payment Channel Support
- Card payments (Visa, Mastercard, Verve)
- Bank transfers
- USSD payments
- Mobile money
- QR code payments

### 3. Enhanced Error Handling
- Proper status tracking (pending, completed, failed, abandoned)
- Gateway response logging
- Automatic retry logic for failed payments

## Fee Structure

### Paystack Fees (automatically calculated)
- Fixed fee: ₦100
- Percentage fee: 1.5% of transaction amount
- Example: ₦10,000 service = ₦100 + ₦150 = ₦250 total fees

### Platform Commission
- Platform takes 10% commission from service providers
- Commission is calculated after payment gateway fees
- Providers receive 90% of the service amount (minus gateway fees)

## Testing

### Test Card Numbers

Use these Paystack test cards for development:

```bash
# Successful payments
Card: 4084084084084081
CVV: 408
Expiry: Any future date

# Failed payments
Card: 4084084084084002
CVV: 408
Expiry: Any future date

# Insufficient funds
Card: 4084084084084003
CVV: 408
Expiry: Any future date
```

### Test Workflow

1. Create a booking in development
2. Proceed to payment with test card
3. Complete payment on Paystack test page
4. Verify webhook is received and processed
5. Check booking status is updated to CONFIRMED

## Troubleshooting

### Common Issues

1. **Webhook not received:**
   - Check webhook URL is correct and accessible
   - Verify SSL certificate (production)
   - Check server logs for incoming POST requests

2. **Payment verification fails:**
   - Verify PAYSTACK_SECRET_KEY is correct
   - Check transaction reference format
   - Ensure API endpoint is accessible

3. **Invalid signature errors:**
   - Verify webhook signature calculation
   - Check PAYSTACK_SECRET_KEY matches dashboard
   - Ensure raw request body is used for signature verification

### Debugging

Enable debug logging by adding:
```bash
DEBUG=paystack:*
```

Check application logs for detailed payment processing information.
