# Payment Provider Implementation Guide

## Paystack Integration

### Setup
1. Create Paystack account
2. Configure webhook URL
3. Set up split payment recipients
4. Generate API keys

### Implementation

#### Initialize Transaction
```typescript
// packages/payments/src/providers/paystack.ts
export async function initializePaystackPayment(
  params: PaymentInitParams
): Promise<PaymentSession> {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.customerEmail,
      amount: params.amount * 100, // Convert to kobo
      reference: params.reference,
      split_code: process.env.PAYSTACK_SPLIT_CODE,
      callback_url: `${process.env.APP_URL}/payment/verify`,
    }),
  });

  return response.json();
}
```

#### Verify Transaction
```typescript
export async function verifyPaystackTransaction(
  reference: string
): Promise<TransactionStatus> {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  return response.json();
}
```

## Flutterwave Integration

### Setup
1. Create Flutterwave account
2. Configure webhook URL
3. Set up subaccounts
4. Generate API keys

### Implementation

#### Initialize Transaction
```typescript
// packages/payments/src/providers/flutterwave.ts
export async function initializeFlutterwavePayment(
  params: PaymentInitParams
): Promise<PaymentSession> {
  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: params.reference,
      amount: params.amount,
      currency: 'NGN',
      redirect_url: `${process.env.APP_URL}/payment/verify`,
      customer: {
        email: params.customerEmail,
      },
      customizations: {
        title: 'UnibenServices Payment',
        logo: 'https://unibenservices.com/logo.png',
      },
    }),
  });

  return response.json();
}
```

#### Verify Transaction
```typescript
export async function verifyFlutterwaveTransaction(
  transactionId: string
): Promise<TransactionStatus> {
  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    }
  );

  return response.json();
}
```

## Webhook Implementation

### Paystack Webhook
```typescript
// packages/payments/src/webhooks/paystack.ts
export async function handlePaystackWebhook(
  req: Request,
  res: Response
): Promise<void> {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    throw new Error('Invalid signature');
  }

  const event = req.body;

  switch (event.event) {
    case 'charge.success':
      await handleSuccessfulPayment(event.data);
      break;
    case 'transfer.success':
      await handleSuccessfulPayout(event.data);
      break;
    // Handle other events
  }
}
```

### Flutterwave Webhook
```typescript
// packages/payments/src/webhooks/flutterwave.ts
export async function handleFlutterwaveWebhook(
  req: Request,
  res: Response
): Promise<void> {
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  const signature = req.headers['verif-hash'];

  if (!signature || signature !== secretHash) {
    throw new Error('Invalid signature');
  }

  const event = req.body;

  switch (event.event) {
    case 'charge.completed':
      await handleSuccessfulPayment(event.data);
      break;
    case 'transfer.completed':
      await handleSuccessfulPayout(event.data);
      break;
    // Handle other events
  }
}
```

## Testing

### Test Environment Setup
```typescript
// packages/payments/src/test/setup.ts
export function setupTestEnvironment(): void {
  process.env.PAYSTACK_SECRET_KEY = 'sk_test_xxx';
  process.env.FLUTTERWAVE_SECRET_KEY = 'FLWSECK_TEST_xxx';
}
```

### Mock Responses
```typescript
// packages/payments/src/test/mocks.ts
export const mockPaystackResponse = {
  status: true,
  message: 'Authorization URL created',
  data: {
    authorization_url: 'https://checkout.paystack.com/abc123',
    access_code: 'abc123',
    reference: 'REF123',
  },
};

export const mockFlutterwaveResponse = {
  status: 'success',
  message: 'Payment link created',
  data: {
    link: 'https://checkout.flutterwave.com/xyz789',
  },
};
```
