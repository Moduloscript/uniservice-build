# Payment Form Components Guide

## Core Payment Form Components

### 1. PaymentMethodForm

```typescript
// Location: modules/shared/components/payments/forms/payment-method-form.tsx

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const paymentFormSchema = z.object({
  provider: z.enum(["PAYSTACK", "FLUTTERWAVE"]),
  saveCard: z.boolean().default(false),
})

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
  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      provider: "PAYSTACK",
      saveCard: false,
    },
  })

  return (
    <Form {...form}>
      {/* Form implementation */}
    </Form>
  )
}
```

### 2. PaymentConfirmationDialog

```typescript
// Location: modules/shared/components/payments/modals/payment-confirmation-dialog.tsx

interface PaymentConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  serviceName: string
  onConfirm: () => void
}

export function PaymentConfirmationDialog({
  open,
  onOpenChange,
  amount,
  serviceName,
  onConfirm,
}: PaymentConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Dialog implementation */}
    </Dialog>
  )
}
```

## Form Validation

We use Zod for form validation:

```typescript
// Location: modules/shared/components/payments/schemas/payment-schemas.ts

export const paymentMethodSchema = z.object({
  provider: z.enum(["PAYSTACK", "FLUTTERWAVE"]),
  saveCard: z.boolean().default(false),
})

export const cardDetailsSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/),
  cvv: z.string().regex(/^\d{3,4}$/),
})
```

## State Management

```typescript
// Location: modules/shared/components/payments/stores/payment-store.ts

export const usePaymentStore = create<PaymentStore>((set) => ({
  currentStep: "METHOD_SELECTION",
  setStep: (step) => set({ currentStep: step }),
  resetStore: () => set({ currentStep: "METHOD_SELECTION" }),
}))
```

## Loading States

```typescript
// Location: modules/shared/components/payments/loading/payment-form-skeleton.tsx

export function PaymentFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
      <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
      <div className="h-10 w-1/2 bg-gray-200 animate-pulse rounded" />
    </div>
  )
}
```

## Error Handling

```typescript
// Location: modules/shared/components/payments/error-handling/payment-error.tsx

export function PaymentError({ error }: { error: Error }) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Payment Error
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {error.message}
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Integration Example

```typescript
// Location: modules/shared/components/payments/checkout-page.tsx

export default function CheckoutPage({
  params: { bookingId },
}: {
  params: { bookingId: string }
}) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Suspense fallback={<PaymentFormSkeleton />}>
        <PaymentMethodForm
          bookingId={bookingId}
          amount={5000}
          onSuccess={handlePaymentSuccess}
        />
      </Suspense>
      
      <PaymentConfirmationDialog
        amount={5000}
        serviceName="Tutorial Session"
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConfirmPayment}
      />
    </div>
  )
}
```

## Component Testing

```typescript
// Location: modules/shared/components/payments/__tests__/payment-method-form.test.tsx

describe("PaymentMethodForm", () => {
  it("submits with valid data", async () => {
    render(
      <PaymentMethodForm
        amount={5000}
        bookingId="booking_123"
        onSuccess={jest.fn()}
      />
    )
    
    // Test implementation
  })
})
```

## Styling Guidelines

All components use Tailwind CSS with ShadcnUI:

```typescript
// Common style patterns
const commonStyles = {
  form: "space-y-6",
  input: "w-full rounded-lg border border-gray-300",
  button: "w-full bg-primary text-white rounded-lg",
  error: "text-sm text-red-500 mt-1",
}
```

## Accessibility Features

```typescript
// Location: modules/shared/components/payments/a11y/payment-form-a11y.tsx

export function PaymentFormA11y() {
  return (
    <div role="form" aria-label="Payment Information">
      {/* Accessible form elements */}
    </div>
  )
}
```

## Performance Optimization

```typescript
// Location: modules/shared/components/payments/optimization/lazy-payment-form.tsx

const LazyPaymentForm = dynamic(() =>
  import("../forms/payment-method-form").then((mod) => mod.PaymentMethodForm)
)

export function OptimizedPaymentForm(props: PaymentMethodFormProps) {
  return (
    <Suspense fallback={<PaymentFormSkeleton />}>
      <LazyPaymentForm {...props} />
    </Suspense>
  )
}
```
