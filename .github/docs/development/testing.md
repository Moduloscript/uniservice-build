# Testing Guidelines

## Overview

Our testing strategy employs multiple layers:
1. Unit Tests (Jest + React Testing Library)
2. Integration Tests (Jest + MSW)
3. E2E Tests (Playwright)
4. API Tests (Supertest)

## Test Structure

### Directory Organization
```
module/
  __tests__/              # Unit tests
  __integration__/        # Integration tests
  __e2e__/               # End-to-end tests
  __mocks__/             # Mock data and services
```

## Unit Testing

### Component Testing

```typescript
// UserProfile.test.tsx
import { render, screen } from '@testing-library/react'
import { UserProfile } from './UserProfile'

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  }

  it('renders user information', () => {
    render(<UserProfile user={mockUser} />)
    
    expect(screen.getByText(mockUser.name)).toBeInTheDocument()
    expect(screen.getByText(mockUser.email)).toBeInTheDocument()
  })

  it('handles loading state', () => {
    render(<UserProfile isLoading />)
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })
})
```

### Hook Testing

```typescript
// useUser.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useUser } from './useUser'

describe('useUser', () => {
  it('fetches user data', async () => {
    const { result } = renderHook(() => useUser('1'))

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
  })

  it('handles error state', async () => {
    // Mock failed API call
    server.use(
      rest.get('/api/users/:id', (req, res, ctx) => {
        return res(ctx.status(404))
      })
    )

    const { result } = renderHook(() => useUser('invalid-id'))

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
    })
  })
})
```

## Integration Testing

### API Integration

```typescript
// payment-api.test.ts
import { createServer } from '@/test/utils/server'
import { prisma } from '@/packages/database'

describe('Payment API', () => {
  let server: ReturnType<typeof createServer>

  beforeAll(() => {
    server = createServer()
  })

  afterAll(() => {
    server.close()
  })

  it('processes payment successfully', async () => {
    const response = await server
      .post('/api/payments')
      .send({
        amount: 5000,
        provider: 'PAYSTACK'
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('transactionId')
  })
})
```

### Component Integration

```typescript
// BookingFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingFlow } from './BookingFlow'

describe('BookingFlow', () => {
  it('completes booking process', async () => {
    const user = userEvent.setup()
    render(<BookingFlow />)

    // Fill booking details
    await user.type(
      screen.getByLabelText(/service date/i),
      '2025-05-20'
    )

    // Select payment method
    await user.click(screen.getByText(/paystack/i))

    // Complete booking
    await user.click(screen.getByText(/confirm booking/i))

    await waitFor(() => {
      expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument()
    })
  })
})
```

## Payment Integration Testing

### Mock Payment Providers
```typescript
// __mocks__/payment-providers.ts
import { PaymentProvider } from '@/packages/payments/types'

export const mockPaystack: PaymentProvider = {
  initialize: jest.fn(),
  verify: jest.fn(),
  refund: jest.fn()
}

export const mockFlutterwave: PaymentProvider = {
  initialize: jest.fn(),
  verify: jest.fn(),
  refund: jest.fn()
}
```

### Payment Flow Testing
```typescript
// modules/payments/__tests__/payment-flow.test.ts
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentFlow } from '../components/payment-flow'
import { mockPaystack } from '@/mocks/payment-providers'

describe('PaymentFlow', () => {
  const mockBooking = {
    id: '1',
    amount: 5000,
    currency: 'NGN'
  }

  beforeEach(() => {
    mockPaystack.initialize.mockClear()
    mockPaystack.verify.mockClear()
  })

  it('initializes payment with correct amount', async () => {
    render(<PaymentFlow booking={mockBooking} />)
    
    await userEvent.click(screen.getByText('Pay Now'))
    
    expect(mockPaystack.initialize).toHaveBeenCalledWith({
      amount: 5000,
      currency: 'NGN',
      reference: expect.any(String)
    })
  })

  it('handles successful payment verification', async () => {
    mockPaystack.verify.mockResolvedValueOnce({ status: 'success' })
    
    render(<PaymentFlow booking={mockBooking} />)
    
    await userEvent.click(screen.getByText('Pay Now'))
    
    await waitFor(() => {
      expect(screen.getByText('Payment Successful')).toBeInTheDocument()
    })
  })
})
```

## Authentication Testing

### Auth Flow Testing
```typescript
// modules/auth/__tests__/auth-flow.test.ts
import { render, screen } from '@testing-library/react'
import { AuthFlow } from '../components/auth-flow'
import { mockAuthProvider } from '@/mocks/auth-provider'

describe('AuthFlow', () => {
  beforeEach(() => {
    mockAuthProvider.signIn.mockClear()
    mockAuthProvider.verify.mockClear()
  })

  it('handles student verification flow', async () => {
    const mockStudent = {
      matricNumber: '12345',
      idCardImage: new File([''], 'id-card.jpg')
    }

    render(<AuthFlow role="student" />)
    
    await userEvent.type(
      screen.getByLabelText('Matric Number'),
      mockStudent.matricNumber
    )
    
    await userEvent.upload(
      screen.getByLabelText('Upload ID Card'),
      mockStudent.idCardImage
    )
    
    await userEvent.click(screen.getByText('Verify'))
    
    expect(mockAuthProvider.verify).toHaveBeenCalledWith({
      role: 'student',
      matricNumber: mockStudent.matricNumber,
      idCard: mockStudent.idCardImage
    })
  })
})
```

## E2E Testing

### Playwright Tests

```typescript
// booking-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Booking Flow', () => {
  test('user can complete booking', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')

    // Navigate to service
    await page.goto('/services/1')
    await page.click('button:text("Book Now")')

    // Fill booking details
    await page.fill('[name="date"]', '2025-05-20')
    await page.selectOption('[name="time"]', '10:00')

    // Complete payment
    await page.click('button:text("Pay Now")')
    await expect(page).toHaveURL(/\/payment\/success/)
  })
})
```

### Test Configuration
```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' }
    },
    {
      name: 'Mobile Chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 414, height: 896 },
        deviceScaleFactor: 2
      }
    }
  ]
}

export default config
```

### Service Booking Flow Test
```typescript
// tests/e2e/service-booking.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Service Booking Flow', () => {
  test('student can book a service', async ({ page }) => {
    // Login as student
    await page.goto('/auth/login')
    await page.fill('[name="matricNumber"]', '12345')
    await page.click('text=Login')
    
    // Browse services
    await page.goto('/services')
    await page.click('text=Laundry Service')
    
    // Fill booking form
    await page.fill('[name="date"]', '2025-05-20')
    await page.fill('[name="time"]', '14:00')
    await page.click('text=Book Now')
    
    // Complete payment
    await page.click('text=Pay with Paystack')
    await page.fill('[name="card-number"]', '4084084084084081')
    await page.fill('[name="expiry"]', '12/25')
    await page.fill('[name="cvv"]', '123')
    await page.click('text=Pay Now')
    
    // Verify success
    await expect(page.locator('text=Booking Confirmed')).toBeVisible()
  })
})
```

## API Testing

### Endpoint Testing

```typescript
// services-api.test.ts
import request from 'supertest'
import { app } from '../src/app'

describe('Services API', () => {
  it('GET /api/services returns list of services', async () => {
    const response = await request(app)
      .get('/api/services')
      .set('Authorization', `Bearer ${testToken}`)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })
})
```

## Test Utilities

### Mock Providers

```typescript
// test/providers/TestProvider.tsx
export function TestProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

### Mock Data

```typescript
// test/mocks/data.ts
export const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  // More mock users...
]
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
}
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' }
    },
    {
      name: 'Mobile Chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 414, height: 896 },
        deviceScaleFactor: 2
      }
    }
  ]
}

export default config
```

## Best Practices

1. **Test Organization**
   - Group related tests
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Testing Priorities**
   - Critical business flows
   - Error handling
   - Edge cases
   - Performance benchmarks

3. **Code Coverage**
   - Aim for 80% coverage
   - Focus on business logic
   - Cover error cases

4. **Continuous Integration**
   - Run tests on every PR
   - Maintain test stability
   - Monitor test duration