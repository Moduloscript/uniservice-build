# Frontend Payment Components

## Overview
This document outlines the frontend payment components used in UnibenServices, built with Next.js 15+, ShadcnUI, and TypeScript. Our components follow Server-First architecture with minimal client components.

## Component Structure
```
modules/
  shared/
    components/
      payments/
        forms/
          payment-method-form.tsx
          payment-details-form.tsx
        modals/
          payment-confirmation-modal.tsx
          payment-status-modal.tsx
        elements/
          payment-provider-selector.tsx
          amount-display.tsx
          payment-status-badge.tsx
        checkout/
          checkout-summary.tsx
          checkout-form.tsx
```

## Core Components

### PaymentMethodForm
Server Component that handles payment method selection and validation.

```typescript
// modules/shared/components/payments/forms/payment-method-form.tsx
interface PaymentMethodFormProps {
  amount: number
  bookingId: string
  onSuccess?: (sessionId: string) => void
}

export function PaymentMethodForm({
  amount,
  bookingId,
  onSuccess,
}: PaymentMethodFormProps) {
  // Implementation details
}
```

Usage:
```tsx
<PaymentMethodForm 
  amount={5000} 
  bookingId="booking_123"
  onSuccess={(sessionId) => console.log(sessionId)} 
/>
```

### PaymentStatusBadge
Server Component for displaying payment status with appropriate styling.

```typescript
// modules/shared/components/payments/elements/payment-status-badge.tsx
interface PaymentStatusBadgeProps {
  status: PaymentStatus
  className?: string
}

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  // Implementation details
}
```

### PaymentConfirmationModal
Client Component for confirming payment details before processing.

```typescript
// modules/shared/components/payments/modals/payment-confirmation-modal.tsx
"use client"

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  amount: number
  serviceName: string
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  amount,
  serviceName,
}: PaymentConfirmationModalProps) {
  // Implementation details
}
```

## Hooks and Utilities

### usePaymentSession
Custom hook for managing payment session state.

```typescript
// modules/shared/components/payments/hooks/use-payment-session.ts
export function usePaymentSession(sessionId: string) {
  const [status, setStatus] = useState<PaymentStatus>("pending")
  
  // Implementation details
}
```

## State Management

We use React Query for server state management:

```typescript
// modules/shared/components/payments/queries/payment-queries.ts
export const paymentKeys = {
  all: ["payments"] as const,
  session: (id: string) => [...paymentKeys.all, "session", id] as const,
  history: (userId: string) => [...paymentKeys.all, "history", userId] as const,
}

export function usePaymentSession(sessionId: string) {
  return useQuery({
    queryKey: paymentKeys.session(sessionId),
    queryFn: () => fetchPaymentSession(sessionId),
  })
}
```

## Styling Guidelines

We use Tailwind CSS with ShadcnUI components:

```typescript
// modules/shared/components/payments/elements/amount-display.tsx
import { cn } from "@/lib/utils"

interface AmountDisplayProps {
  amount: number
  currency?: string
  className?: string
}

export function AmountDisplay({
  amount,
  currency = "NGN",
  className,
}: AmountDisplayProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className="text-sm text-muted-foreground">{currency}</span>
      <span className="text-lg font-semibold">
        {(amount / 100).toLocaleString()}
      </span>
    </div>
  )
}
```

## Best Practices

1. **Server Components First**
   - Use Server Components by default
   - Only use Client Components when necessary (e.g., form submissions, modals)

2. **Type Safety**
   - Define clear interfaces for all props
   - Use zod for form validation
   - Leverage TypeScript's strict mode

3. **Error Handling**
   ```typescript
   // modules/shared/components/payments/error-boundary.tsx
   export function PaymentErrorBoundary({
     children,
   }: {
     children: React.ReactNode
   }) {
     // Implementation details
   }
   ```

4. **Loading States**
   ```typescript
   // modules/shared/components/payments/loading-states.tsx
   export function PaymentFormSkeleton() {
     return (
       <div className="space-y-4 animate-pulse">
         {/* Skeleton implementation */}
       </div>
     )
   }
   ```

## Performance Optimization

1. **Code Splitting**
```typescript
// Dynamic imports for heavy components
const PaymentModal = dynamic(() => 
  import("../modals/payment-modal").then(mod => mod.PaymentModal)
)
```

2. **Suspense Boundaries**
```typescript
<Suspense fallback={<PaymentFormSkeleton />}>
  <PaymentMethodForm />
</Suspense>
```

## Integration Example

Here's a complete example of a payment flow:

```typescript
// modules/shared/components/payments/checkout-flow.tsx
export function CheckoutFlow({
  service,
  booking,
}: CheckoutFlowProps) {
  return (
    <div className="space-y-6">
      <CheckoutSummary service={service} booking={booking} />
      
      <Suspense fallback={<PaymentFormSkeleton />}>
        <PaymentMethodForm
          amount={service.price}
          bookingId={booking.id}
          onSuccess={handlePaymentSuccess}
        />
      </Suspense>
      
      <PaymentStatusModal />
    </div>
  )
}
```

## Testing

Example test for payment components:

```typescript
// modules/shared/components/payments/__tests__/payment-form.test.tsx
describe("PaymentMethodForm", () => {
  it("validates required fields", async () => {
    // Test implementation
  })
  
  it("handles successful payment initialization", async () => {
    // Test implementation
  })
})
```

## Accessibility

All payment components follow WCAG 2.1 guidelines:

1. Proper ARIA labels
2. Keyboard navigation
3. High contrast support
4. Screen reader compatibility

## Error Messages

Consistent error message handling:

```typescript
export const paymentErrors = {
  INVALID_AMOUNT: "Please enter a valid amount",
  PAYMENT_FAILED: "Payment processing failed. Please try again",
  NETWORK_ERROR: "Network error. Please check your connection",
} as const
```
