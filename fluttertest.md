# Flutterwave Payment Integration Plan

## Overview
This document outlines the implementation plan for integrating Flutterwave payment processing into our SupaStarter NextJS application, with focus on secure webhook handling, transaction verification, and payment flow management.

**Based on Flutterwave Official Documentation**: https://developer.flutterwave.com/v3.0.0/docs/webhooks

## Key Requirements from Documentation

### 1. Webhook Structure & Configuration (v3.0.0)
- **Webhook URL**: Publicly accessible endpoint on our server
- **Secret Hash**: Random, secure value stored in environment variables (`FLW_SECRET_HASH`)
- **Signature Verification**: `verif-hash` header validation (NOT `flutterwave-signature`)
- **Response Requirements**: Must return HTTP 200 status within 60 seconds
- **Retry Logic**: 3 retries with 30-minute intervals
- **IP Whitelisting**: NOT recommended - Flutterwave IPs are dynamic
- **CSRF Protection**: Exclude webhook endpoints from CSRF protection in web frameworks

### 2. Webhook Payload Structure (v3.0.0)
All webhook payloads follow the same basic structure with an `event` field and a `data` object:

#### Successful Payment Example
```json
{
  "event": "charge.completed",
  "data": {
    "id": 285959875,
    "tx_ref": "Links-616626414629",
    "flw_ref": "PeterEkene/FLW270177170",
    "device_fingerprint": "a42937f4a73ce8bb8b8df14e63a2df31",
    "amount": 100,
    "currency": "NGN",
    "charged_amount": 100,
    "app_fee": 1.4,
    "merchant_fee": 0,
    "processor_response": "Approved by Financial Institution",
    "auth_model": "PIN",
    "ip": "197.149.95.62",
    "narration": "CARD Transaction ",
    "status": "successful",
    "payment_type": "card",
    "created_at": "2020-07-06T19:17:04.000Z",
    "account_id": 17321,
    "customer": {
      "id": 215604089,
      "name": "Yemi Desola",
      "phone_number": null,
      "email": "yemi@flutterwave.com",
      "created_at": "2020-07-06T19:17:04.000Z"
    },
    "card": {
      "first_6digits": "470131",
      "last_4digits": "0002",
      "issuer": "MASTERCARD CREDIT",
      "country": "NG",
      "type": "CREDIT",
      "expiry": "09/32"
    }
  }
}
```

#### Bill Payment Example
```json
{
  "event": "singlebillpayment.status",
  "event.type": "SingleBillPayment",
  "data": {
    "customer": "+2347065657658",
    "amount": 200,
    "network": "MTN",
    "tx_ref": "CF-FLYAPI-20240604022555817834333",
    "flw_ref": "BPUSSD17175111565077679855",
    "batch_reference": null,
    "customer_reference": "test-ref-kuf-01",
    "status": "success",
    "message": "Bill Payment was completed successfully",
    "reference": null
  }
}
```

### 3. Webhook Event Types
- **charge.completed**: Payment successful
- **charge.failed**: Payment failed
- **transfer.completed**: Transfer successful
- **transfer.failed**: Transfer failed
- **singlebillpayment.status**: Bill payment status update
- **virtual-card-debit**: Virtual card transaction
- **virtual-card-otp**: Virtual card OTP request

## Implementation Plan

### Phase 1: Database Schema Updates

#### 1.1 Update Payment Model
Enhance the existing `payment` model to support Flutterwave-specific fields:

```prisma
model payment {
  id              String          @id
  amount          Decimal
  currency        String          @default("NGN")
  status          PaymentStatus
  provider        PaymentProvider
  transactionRef  String          @unique
  paymentMethod   String?         // card, bank, ussd, mobile_money, etc.
  channel         String?         // Actual channel used (from Flutterwave)
  gatewayResponse String?         // Gateway response message
  fees            Decimal?        // Transaction fees
  paidAt          DateTime?       // Actual payment time
  bookingId       String          @unique
  providerId      String
  escrowStatus    EscrowStatus?
  authorizationCode String?       // For recurring payments
  customerCode    String?         // Flutterwave customer code
  metadata        Json?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  // Flutterwave specific fields
  flutterwaveId   String?         @unique // Flutterwave transaction ID
  flutterwaveRef  String?         @unique // Flutterwave reference
  verifiedAt      DateTime?       // When transaction was verified
  
  booking         booking         @relation(fields: [bookingId], references: [id])
}
```

#### 1.2 Webhook Events Tracking
```prisma
model webhook_event {
  id          String    @id @default(uuid())
  provider    String    // flutterwave, paystack
  event_type  String    // charge.completed, transfer.failed, etc.
  reference   String    // transaction reference
  processed   Boolean   @default(false)
  retry_count Int       @default(0)
  payload     Json      // Full webhook payload
  error       String?   // Error message if processing failed
  signature   String?   // Webhook signature for verification
  createdAt   DateTime  @default(now())
  processedAt DateTime?
  
  @@index([reference])
  @@index([processed])
  @@index([provider, event_type])
}
```

### Phase 2: Environment Configuration

#### 2.1 Required Environment Variables
```env
# Flutterwave Configuration
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxx
FLUTTERWAVE_SECRET_HASH=your-random-secure-hash
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTxxxxx

# Webhook URLs
FLUTTERWAVE_WEBHOOK_URL=https://yourapp.com/api/webhooks/flutterwave
```

### Phase 3: API Implementation

#### 3.1 Webhook Endpoint (`/api/webhooks/flutterwave`)
```typescript
// packages/api/src/routes/webhooks/flutterwave.ts
import { Hono } from "hono";
import { db } from "@repo/database";
import crypto from "crypto";

export const flutterwaveWebhookRouter = new Hono()
  .post("/", async (c) => {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = c.req.header("verif-hash");
    
    // 1. Verify webhook signature (using correct v3.0.0 header name)
    if (!signature || signature !== secretHash) {
      console.warn("Invalid Flutterwave webhook signature");
      return c.json({ error: "Invalid signature" }, 401);
    }
    
    const payload = await c.req.json();
    const webhookId = crypto.randomUUID();
    
    try {
      // 2. Log webhook event immediately
      const webhookEvent = await db.webhook_event.create({
        data: {
          id: webhookId,
          provider: "flutterwave",
          event_type: payload.type,
          reference: payload.data.reference,
          payload: payload,
          signature: signature,
        },
      });
      
      // 3. Process webhook event
      await processFlutterwaveWebhook(payload, webhookEvent.id);
      
      // 4. Mark as processed
      await db.webhook_event.update({
        where: { id: webhookId },
        data: { 
          processed: true, 
          processedAt: new Date() 
        },
      });
      
      return c.json({ status: "success" }, 200);
    } catch (error) {
      console.error("Flutterwave webhook processing error:", error);
      
      // Update webhook event with error
      await db.webhook_event.update({
        where: { id: webhookId },
        data: { 
          error: error.message,
          retry_count: { increment: 1 }
        },
      });
      
      return c.json({ error: "Processing failed" }, 500);
    }
  });
```

#### 3.2 Webhook Processing Logic
```typescript
// packages/api/src/utils/flutterwave-webhook.ts
import { FlutterwaveAPI } from "./flutterwave-api";

export async function processFlutterwaveWebhook(payload: any, webhookId: string) {
  const { type, data } = payload;
  
  switch (type) {
    case "charge.completed":
      await handleChargeCompleted(data);
      break;
    case "charge.failed":
      await handleChargeFailed(data);
      break;
    case "transfer.completed":
      await handleTransferCompleted(data);
      break;
    default:
      console.log(`Unhandled webhook type: ${type}`);
  }
}

async function handleChargeCompleted(data: any) {
  // 1. Verify transaction with Flutterwave API
  const verification = await FlutterwaveAPI.verifyTransaction(data.id);
  
  if (!verification.success) {
    throw new Error("Transaction verification failed");
  }
  
  const { transaction } = verification.data;
  
  // 2. Find existing payment record
  const payment = await db.payment.findUnique({
    where: { transactionRef: data.reference },
    include: { booking: true },
  });
  
  if (!payment) {
    throw new Error(`Payment not found for reference: ${data.reference}`);
  }
  
  // 3. Verify critical transaction data
  if (
    transaction.status !== "successful" ||
    transaction.amount !== payment.amount.toNumber() ||
    transaction.currency !== payment.currency ||
    transaction.tx_ref !== payment.transactionRef
  ) {
    throw new Error("Transaction verification mismatch");
  }
  
  // 4. Update payment status
  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "COMPLETED",
      flutterwaveId: data.id,
      flutterwaveRef: data.reference,
      paidAt: new Date(data.created_datetime * 1000),
      verifiedAt: new Date(),
      gatewayResponse: JSON.stringify(data.processor_response),
      fees: data.app_fee ? parseFloat(data.app_fee) : null,
      channel: data.payment_method?.type,
      escrowStatus: "RELEASED",
    },
  });
  
  // 5. Update booking status
  await db.booking.update({
    where: { id: payment.bookingId },
    data: { status: "CONFIRMED" },
  });
  
  // 6. Send confirmation notifications
  await sendPaymentConfirmation(payment.bookingId);
}
```

#### 3.3 Transaction Verification API
```typescript
// packages/api/src/utils/flutterwave-api.ts
export class FlutterwaveAPI {
  private static readonly baseURL = "https://api.flutterwave.com/v3";
  private static readonly secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  
  static async verifyTransaction(transactionId: string) {
    const response = await fetch(
      `${this.baseURL}/transactions/${transactionId}/verify`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Verification failed: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  static async initializePayment(paymentData: {
    amount: number;
    currency: string;
    email: string;
    phone?: string;
    name: string;
    tx_ref: string;
    redirect_url: string;
  }) {
    const response = await fetch(`${this.baseURL}/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });
    
    if (!response.ok) {
      throw new Error(`Payment initialization failed: ${response.statusText}`);
    }
    
    return response.json();
  }
}
   
### Phase 4: Frontend Integration

#### 4.1 Payment Component Updates
```typescript
// apps/web/modules/payments/components/flutterwave-processor.tsx
import { FlutterwaveHook, closePaymentModal } from 'flutterwave-react-v3';

interface FlutterwaveProcessorProps {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  transactionRef: string;
  onSuccess: (transaction: any) => void;
  onError: (error: string) => void;
}

export function FlutterwaveProcessor({
  amount,
  currency = "NGN",
  customerEmail,
  customerName,
  customerPhone,
  transactionRef,
  onSuccess,
  onError,
}: FlutterwaveProcessorProps) {
  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY!,
    tx_ref: transactionRef,
    amount,
    currency,
    customer: {
      email: customerEmail,
      phone_number: customerPhone,
      name: customerName,
    },
    customizations: {
      title: "UniService Payment",
      description: "Payment for booking service",
      logo: "/logo.png",
    },
    callback: (response: any) => {
      closePaymentModal();
      if (response.status === "successful") {
        onSuccess(response);
      } else {
        onError("Payment was not successful");
      }
    },
    onClose: () => {
      onError("Payment was cancelled");
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  return (
    <Button 
      onClick={() => handleFlutterPayment()}
      className="w-full"
    >
      Pay with Flutterwave
    </Button>
  );
}
```

## Test Credentials Used
- **Public Key**: `FLWPUBK_TEST-761b2a0f4fc5f29424e7459e4ae97b99-X`
- **Secret Key**: `FLWSECK_TEST-6945f30d39e6df1c80f8ace427d6f4b0-X`
- **Encryption Key**: `FLWSECK_TESTd78f5fb985cc`

## API Test Results

### ✅ 1. Get Nigerian Banks List
**Endpoint**: `GET /v3/banks/NG`
```bash
curl -X GET 'https://api.flutterwave.com/v3/banks/NG' \
--header 'Authorization: Bearer FLWSECK_TEST-6945f30d39e6df1c80f8ace427d6f4b0-X' \
--header 'Content-Type: application/json'
```
**Result**: ✅ Success - Retrieved 400+ Nigerian banks including major ones like GTBank, First Bank, Zenith, etc.

### ✅ 2. Standard Payment Initialization
**Endpoint**: `POST /v3/payments`
```bash
curl -X POST 'https://api.flutterwave.com/v3/payments' \
--header 'Authorization: Bearer FLWSECK_TEST-6945f30d39e6df1c80f8ace427d6f4b0-X' \
--header 'Content-Type: application/json' \
--data '{
  "tx_ref": "uniservice-booking-789",
  "amount": "5000",
  "currency": "NGN",
  "redirect_url": "http://localhost:3000/payment/verify",
  "payment_options": "card,banktransfer,ussd",
  "customer": {
    "email": "student@uniben.edu",
    "phonenumber": "08123456789",
    "name": "John Doe"
  },
  "customizations": {
    "title": "UnibenServices - Tutoring Payment",
    "description": "Payment for Mathematics tutoring session",
    "logo": "https://unibenservices.com/logo.png"
  },
  "meta": {
    "booking_id": "booking_123",
    "service_type": "tutoring",
    "provider_id": "tutor_456"
  }
}'
```
**Result**: ✅ Success
- **Payment Link**: `https://checkout-v2.dev-flutterwave.com/v3/hosted/pay/8b3766458250498d53d9`
- **Amount**: ₦5,000
- **Payment Options**: Card, Bank Transfer, USSD

### ✅ 3. Transaction Fee Calculation
**Endpoint**: `GET /v3/transactions/fee`
```bash
curl -X GET 'https://api.flutterwave.com/v3/transactions/fee?amount=1000&currency=NGN' \
--header 'Authorization: Bearer FLWSECK_TEST-6945f30d39e6df1c80f8ace427d6f4b0-X' \
--header 'Content-Type: application/json'
```
**Result**: ✅ Success
- **Amount**: ₦1,000
- **Total Fee**: ₦14
- **Merchant Fee**: ₦0
- **Flutterwave Fee**: ₦14

### ✅ 4. Bank Account Verification
**Endpoint**: `POST /v3/accounts/resolve`
```bash
curl -X POST 'https://api.flutterwave.com/v3/accounts/resolve' \
--header 'Authorization: Bearer FLWSECK_TEST-6945f30d39e6df1c80f8ace427d6f4b0-X' \
--header 'Content-Type: application/json' \
--data '{
  "account_number": "0690000040",
  "account_bank": "044"
}'
```
**Result**: ✅ Success
- **Account Name**: "Alexis Sanchez"
- **Account Number**: "0690000040"

### ✅ 5. USSD Payment Initiation
**Endpoint**: `POST /v3/charges?type=ussd`
```bash
curl -X POST 'https://api.flutterwave.com/v3/charges?type=ussd' \
--header 'Authorization: Bearer FLWSECK_TEST-6945f30d39e6df1c80f8ace427d6f4b0-X' \
--header 'Content-Type: application/json' \
--data '{
  "tx_ref": "uniservice-ussd-123",
  "amount": "2500",
  "currency": "NGN",
  "account_bank": "058",
  "email": "student@uniben.edu",
  "phone_number": "08123456789",
  "fullname": "John Doe"
}'
```
**Result**: ✅ Success
- **USSD Code**: `*566*002*9514392#`
- **Amount**: ₦2,500
- **Fee**: ₦35
- **Status**: Pending
- **Payment ID**: 9514392

### ✅ 6. Bank Transfer Payment
**Endpoint**: `POST /v3/charges?type=bank_transfer`
```bash
curl -X POST 'https://api.flutterwave.com/v3/charges?type=bank_transfer' \
--header 'Authorization: Bearer FLWSECK_TEST-6945f30d39e6df1c80f8ace427d6f4b0-X' \
--header 'Content-Type: application/json' \
--data '{
  "tx_ref": "uniservice-transfer-456",
  "amount": "7500",
  "currency": "NGN",
  "email": "provider@uniben.edu",
  "phone_number": "08123456789",
  "fullname": "Jane Smith",
  "duration": 2
}'
```
**Result**: ✅ Success
- **Transfer Account**: 0067100155
- **Bank**: Mock Bank
- **Amount**: ₦7,500
- **Expires**: 2025-07-28 23:59:59
- **Reference**: MockFLWRef-1753503678306

### ✅ 7. Virtual Account Creation
**Endpoint**: `POST /v3/virtual-account-numbers`
```bash
curl -X POST 'https://api.flutterwave.com/v3/virtual-account-numbers' \
--header 'Authorization: Bearer FLWSECK_TEST-6945f30d39e6df1c80f8ace427d6f4b0-X' \
--header 'Content-Type: application/json' \
--data '{
  "email": "test@unibenservices.com",
  "is_permanent": true,
  "bvn": "12345678901",
  "tx_ref": "uniservice-va-123456",
  "phonenumber": "08012345678",
  "firstname": "Test",
  "lastname": "Student",
  "narration": "UnibenServices Virtual Account"
}'
```
**Result**: ✅ Success
- **Account Number**: 0067100155
- **Bank Name**: Mock Bank (test environment)
- **Status**: Active
- **Reference**: URF_1753503548601_7680135

### ✅ 8. Payment Plan Creation
**Endpoint**: `POST /v3/payment-plans`
```bash
curl -X POST 'https://api.flutterwave.com/v3/payment-plans' \
--header 'Authorization: Bearer FLWSECK_TEST-6945f30d39e6df1c80f8ace427d6f4b0-X' \
--header 'Content-Type: application/json' \
--data '{
  "amount": 10000,
  "name": "Monthly Tutoring Plan",
  "interval": "monthly",
  "duration": 6,
  "currency": "NGN"
}'
```
**Result**: ✅ Success
- **Plan ID**: 224117
- **Token**: rpp_77de0da03d23594a0bd6
- **Amount**: ₦10,000/month
- **Duration**: 6 months

### ✅ 9. Payment Plan Subscription
**Endpoint**: `POST /v3/payments` (with payment_plan)
```bash
curl -X POST 'https://api.flutterwave.com/v3/payments' \
--header 'Authorization: Bearer FLWSECK_TEST-6945f30d39e6df1c80f8ace427d6f4b0-X' \
--header 'Content-Type: application/json' \
--data '{
  "tx_ref": "uniservice-plan-sub-001",
  "amount": "10000",
  "currency": "NGN",
  "redirect_url": "http://localhost:3000/payment/verify",
  "payment_plan": "224117",
  "customer": {
    "email": "recurring@uniben.edu",
    "phonenumber": "08123456789",
    "name": "Recurring Student"
  },
  "customizations": {
    "title": "Monthly Tutoring Subscription",
    "description": "6-month tutoring plan subscription"
  }
}'
```
**Result**: ✅ Success
- **Payment Link**: `https://checkout-v2.dev-flutterwave.com/v3/hosted/pay/b5b3666232c2a31a9ed4`

### ✅ 10. Mobile Money Payment
**Endpoint**: `POST /v3/charges?type=mobile_money_franco`
```bash
curl -X POST 'https://api.flutterwave.com/v3/charges?type=mobile_money_franco' \
--header 'Authorization: Bearer FLWSECK_TEST-6945f30d39e6df1c80f8ace427d6f4b0-X' \
--header 'Content-Type: application/json' \
--data '{
  "tx_ref": "uniservice-momo-123",
  "amount": "3000",
  "currency": "XOF",
  "email": "momo@uniben.edu",
  "phone_number": "08123456789",
  "fullname": "Mobile User"
}'
```
**Result**: ✅ Success
- **Transaction ID**: 9514394
- **Amount**: 3000 XOF
- **Fee**: 60 XOF
- **Status**: Pending

## Failed/Unavailable Endpoints

### ❌ Payment Verification by Reference
**Endpoint**: `GET /v3/transactions/verify_by_reference`
**Error**: `connect EHOSTUNREACH 132.164.172.56:3306`
**Note**: Internal server connectivity issue

### ❌ Countries List
**Endpoint**: `GET /v3/countries`
**Error**: `Cannot GET /v3/countries`
**Note**: Endpoint not available or deprecated

### ❌ Currencies List
**Endpoint**: `GET /v3/currencies`
**Error**: `Cannot GET /v3/currencies`
**Note**: Endpoint not available or deprecated

### ❌ FX Rates
**Endpoint**: `GET /v3/fx-rates`
**Error**: `Cannot GET /v3/fx-rates`
**Note**: Endpoint not available or deprecated

## Key Insights for UnibenServices Implementation

### 1. Fee Structure
- **Small Transactions (₦1,000)**: ₦14 fee (1.4%)
- **Medium Transactions (₦2,500)**: ₦35 fee (1.4%)
- **Standard Rate**: ~1.4% + base fee

### 2. Payment Methods Successfully Tested
- ✅ **Card Payments** (via hosted checkout)
- ✅ **Bank Transfer** (temporary accounts)
- ✅ **USSD** (dial codes)
- ✅ **Virtual Accounts** (permanent accounts)
- ✅ **Mobile Money** (for broader reach)
- ✅ **Recurring Plans** (subscription services)

### 3. Recommended Implementation Flow
1. **Initialize Payment** → Get hosted link or USSD code
2. **Customer Pays** → Via their preferred method
3. **Verify Payment** → Check transaction status
4. **Update Booking** → Confirm service booking
5. **Notify Parties** → Student and provider notification

### 4. Essential Metadata for Tracking
```json
{
  "meta": {
    "booking_id": "booking_123",
    "service_type": "tutoring",
    "provider_id": "tutor_456",
    "student_id": "student_789"
  }
}
```

### 5. Payment Verification Pattern
- Always verify payments before confirming bookings
- Use both transaction ID and reference for verification
- Implement webhook handling for real-time updates
- Store payment status in database for tracking

## Webhook Best Practices (From v3.0.0 Documentation)

### 1. Always Verify Critical Transaction Data
**CRITICAL**: Before giving value to a customer based on a webhook notification, always re-query the Flutterwave API to verify transaction details.

```javascript
// Example verification logic
const payload = req.body;
const verification = await FlutterwaveAPI.verifyTransaction(payload.data.id);

if (
  verification.data.status === "successful" &&
  verification.data.amount === expectedAmount &&
  verification.data.currency === expectedCurrency &&
  verification.data.tx_ref === expectedReference
) {
  // Success! Confirm the customer's payment
  await confirmBooking(bookingId);
} else {
  // Inform the customer their payment was unsuccessful
  throw new Error("Payment verification failed");
}
```

### 2. Don't Rely Solely on Webhooks
Implement a backup strategy in case webhook endpoints fail:

```javascript
// Background job to poll pending transactions
const checkPendingPayments = async () => {
  const pendingPayments = await db.payment.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  
  for (const payment of pendingPayments) {
    try {
      const verification = await FlutterwaveAPI.verifyTransaction(payment.flutterwaveId);
      if (verification.data.status === "successful") {
        await handleSuccessfulPayment(payment.id, verification.data);
      } else if (verification.data.status === "failed") {
        await handleFailedPayment(payment.id, verification.data);
      }
    } catch (error) {
      console.error(`Failed to verify payment ${payment.id}:`, error);
    }
  }
};

// Run every hour
setInterval(checkPendingPayments, 60 * 60 * 1000);
```

### 3. Use Secret Hash for Security
Always implement signature verification to ensure requests are from Flutterwave:

```javascript
// Correct header name for v3.0.0
const secretHash = process.env.FLW_SECRET_HASH;
const signature = req.headers["verif-hash"];

if (!signature || signature !== secretHash) {
  return res.status(401).json({ error: "Invalid signature" });
}
```

### 4. Respond Quickly (Within 60 Seconds)
- Webhook endpoints must respond within 60 seconds or Flutterwave will retry
- Return HTTP 200 immediately and process in background if needed
- Dispatch long-running tasks to job queues

```javascript
// Good: Immediate response with background processing
app.post("/webhook", async (req, res) => {
  // Verify signature
  if (!verifySignature(req)) {
    return res.status(401).end();
  }
  
  // Respond immediately
  res.status(200).end();
  
  // Process in background
  jobQueue.add('process-webhook', {
    payload: req.body,
    timestamp: Date.now()
  });
});
```

### 5. Be Idempotent (Handle Duplicates)
Flutterwave might send the same webhook event multiple times. Make processing idempotent:

```javascript
const processWebhook = async (payload) => {
  const existingEvent = await db.webhook_event.findUnique({
    where: { 
      provider_event_id: payload.data.id,
      event_type: payload.event 
    }
  });
  
  if (existingEvent && existingEvent.processed) {
    console.log(`Duplicate webhook event ${payload.data.id}, ignoring`);
    return;
  }
  
  // Process the event
  await handleWebhookEvent(payload);
  
  // Mark as processed
  await db.webhook_event.upsert({
    where: {
      provider_event_id: payload.data.id,
      event_type: payload.event
    },
    create: {
      provider_event_id: payload.data.id,
      event_type: payload.event,
      processed: true,
      payload: payload,
      processedAt: new Date()
    },
    update: {
      processed: true,
      processedAt: new Date()
    }
  });
};
```

### 6. Exclude from CSRF Protection
In web frameworks like Rails, Django, or Express with CSRF middleware, exclude webhook endpoints:

```javascript
// Express.js example
app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(csrf({ ignoredMethods: ['POST'] })); // After webhook routes

// Or specifically exclude webhook routes
app.use(csrf({
  ignoredRoutes: ['/api/webhooks/flutterwave']
}));
```

### 7. Comprehensive Error Handling
```javascript
const processFlutterwaveWebhook = async (payload, webhookId) => {
  try {
    // Validate payload structure
    if (!payload.event || !payload.data) {
      throw new Error('Invalid webhook payload structure');
    }
    
    // Verify transaction exists
    const verification = await FlutterwaveAPI.verifyTransaction(payload.data.id);
    if (!verification.success) {
      throw new Error(`Transaction verification failed: ${verification.message}`);
    }
    
    // Process based on event type
    switch (payload.event) {
      case 'charge.completed':
        await handleChargeCompleted(payload.data, verification.data);
        break;
      case 'charge.failed':
        await handleChargeFailed(payload.data);
        break;
      default:
        console.warn(`Unhandled webhook event type: ${payload.event}`);
    }
    
  } catch (error) {
    console.error(`Webhook processing failed for ${webhookId}:`, error);
    
    // Update webhook event with error
    await db.webhook_event.update({
      where: { id: webhookId },
      data: {
        error: error.message,
        retry_count: { increment: 1 }
      }
    });
    
    throw error; // Re-throw to trigger retry logic
  }
};
```

## Next Steps for Implementation
1. Implement Flutterwave provider in `packages/payments/provider/flutterwave/`
2. Add webhook handling for payment status updates
3. Create payment verification service
4. Integrate with booking confirmation system
5. Add fee calculation to booking flow
6. Test with live credentials in staging environment

## Environment Variables Needed
```bash
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-761b2a0f4fc5f29424e7459e4ae97b99-X
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-6945f30d39e6df1c80f8ace427d6f4b0-X
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTd78f5fb985cc
FLUTTERWAVE_WEBHOOK_SECRET_HASH=your_webhook_secret_here
```

---
**Test Date**: July 26, 2025  
**Test Environment**: Flutterwave V3 Test API  
**Status**: ✅ Ready for Implementation
