# Payment Components Testing Strategy

## Overview
This document outlines the testing strategy for payment components in UnibenServices, covering unit tests, integration tests, and end-to-end testing.

## Testing Levels

### 1. Unit Tests

#### Component Testing
```typescript
// modules/shared/components/payments/__tests__/payment-method-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { PaymentMethodForm } from '../forms/payment-method-form'

describe('PaymentMethodForm', () => {
  const mockProps = {
    amount: 5000,
    bookingId: 'booking_123',
    onSuccess: jest.fn(),
  }

  it('renders payment provider options', () => {
    render(<PaymentMethodForm {...mockProps} />)
    expect(screen.getByText('Paystack')).toBeInTheDocument()
    expect(screen.getByText('Flutterwave')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<PaymentMethodForm {...mockProps} />)
    fireEvent.click(screen.getByText('Pay Now'))
    expect(await screen.findByText('Please select a payment method')).toBeInTheDocument()
  })
})
```

#### Hook Testing
```typescript
// modules/shared/components/payments/__tests__/use-payment.test.ts
import { renderHook } from '@testing-library/react-hooks'
import { usePayment } from '../hooks/use-payment'

describe('usePayment', () => {
  it('initializes payment session', async () => {
    const { result } = renderHook(() => usePayment())
    const session = await result.current.initializePayment({
      amount: 5000,
      provider: 'PAYSTACK',
    })
    expect(session).toHaveProperty('reference')
  })
})
```

### 2. Integration Tests

#### API Integration
```typescript
// modules/shared/components/payments/__tests__/payment-api.test.ts
import { testApiHandler } from 'next-test-api-route-handler'
import { paymentHandler } from '../api/payment'

describe('Payment API', () => {
  it('initializes payment', async () => {
    await testApiHandler({
      handler: paymentHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          body: JSON.stringify({
            amount: 5000,
            provider: 'PAYSTACK',
          }),
        })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json).toHaveProperty('authorization_url')
      },
    })
  })
})
```

### 3. E2E Tests

```typescript
// apps/web/tests/payment-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Payment Flow', () => {
  test('completes payment successfully', async ({ page }) => {
    // Setup
    await page.goto('/services/book')
    await page.fill('[name="amount"]', '5000')
    
    // Select payment method
    await page.click('[data-testid="provider-paystack"]')
    
    // Complete payment
    await page.click('button:text("Pay Now")')
    
    // Verify success
    await expect(page.locator('[data-testid="payment-status"]'))
      .toContainText('Payment Successful')
  })
})
```

## Test Categories

### 1. Functional Tests

```typescript
describe('Payment Functionality', () => {
  test('handles successful payment', () => {
    // Test implementation
  })

  test('handles failed payment', () => {
    // Test implementation
  })

  test('validates input fields', () => {
    // Test implementation
  })
})
```

### 2. UI/UX Tests

```typescript
describe('Payment UI', () => {
  test('shows loading states', () => {
    // Test implementation
  })

  test('displays error messages', () => {
    // Test implementation
  })

  test('updates UI based on payment status', () => {
    // Test implementation
  })
})
```

### 3. Error Handling Tests

```typescript
describe('Payment Error Handling', () => {
  test('handles network errors', () => {
    // Test implementation
  })

  test('handles validation errors', () => {
    // Test implementation
  })

  test('handles payment gateway errors', () => {
    // Test implementation
  })
})
```

## Test Utilities

### 1. Mock Data

```typescript
// modules/shared/components/payments/__tests__/mocks/payment-data.ts
export const mockPaymentData = {
  successful: {
    reference: 'TEST_REF_123',
    amount: 5000,
    status: 'success',
  },
  failed: {
    reference: 'TEST_REF_456',
    amount: 5000,
    status: 'failed',
    error: 'Insufficient funds',
  },
}
```

### 2. Test Helpers

```typescript
// modules/shared/components/payments/__tests__/helpers/payment-helpers.ts
export async function mockPaymentProvider(success = true) {
  return {
    initialize: jest.fn().mockResolvedValue({
      reference: 'TEST_REF',
      status: success ? 'success' : 'failed',
    }),
    verify: jest.fn().mockResolvedValue({
      status: success ? 'success' : 'failed',
    }),
  }
}
```

## Testing Best Practices

### 1. Component Testing Guidelines
```typescript
// Best practices for component testing
describe('Component Testing Guidelines', () => {
  // 1. Test user interactions
  test('responds to user interactions', () => {})

  // 2. Test accessibility
  test('meets accessibility requirements', () => {})

  // 3. Test responsive behavior
  test('adapts to different screen sizes', () => {})
})
```

### 2. Integration Testing Guidelines
```typescript
// Best practices for integration testing
describe('Integration Testing Guidelines', () => {
  // 1. Test API interactions
  test('communicates with payment API', () => {})

  // 2. Test state management
  test('manages payment state correctly', () => {})

  // 3. Test error boundaries
  test('handles errors gracefully', () => {})
})
```

## Test Coverage Requirements

```typescript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/components/payments/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
}
```

## CI/CD Integration

```yaml
# .github/workflows/payment-tests.yml
name: Payment Tests
on:
  push:
    paths:
      - 'modules/shared/components/payments/**'
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: pnpm install
      - name: Run tests
        run: pnpm test:payments
```
