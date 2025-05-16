# Payment UI Components & Patterns

## Design System Integration

### Colors and Typography
```typescript
// modules/shared/styles/payment-tokens.ts
export const paymentTokens = {
  colors: {
    success: "var(--success)",
    error: "var(--error)",
    pending: "var(--warning)",
    accent: "var(--accent)",
  },
  typography: {
    amount: "text-xl font-semibold tracking-tight",
    label: "text-sm font-medium text-muted-foreground",
    status: "text-xs font-medium",
  },
}
```

## Shared Components

### 1. PaymentCard

```typescript
// modules/shared/components/payments/elements/payment-card.tsx
interface PaymentCardProps {
  provider: "PAYSTACK" | "FLUTTERWAVE"
  last4?: string
  expiryDate?: string
  isDefault?: boolean
}

export function PaymentCard({
  provider,
  last4,
  expiryDate,
  isDefault,
}: PaymentCardProps) {
  return (
    <div className="relative rounded-lg border p-4 hover:border-primary transition-colors">
      <div className="flex items-center justify-between">
        <PaymentProviderIcon provider={provider} />
        {isDefault && (
          <Badge variant="secondary">Default</Badge>
        )}
      </div>
      {last4 && (
        <p className="mt-2 font-mono">•••• {last4}</p>
      )}
      {expiryDate && (
        <p className="text-sm text-muted-foreground mt-1">
          Expires {expiryDate}
        </p>
      )}
    </div>
  )
}
```

### 2. TransactionHistory

```typescript
// modules/shared/components/payments/elements/transaction-history.tsx
interface Transaction {
  id: string
  amount: number
  status: PaymentStatus
  date: Date
  provider: PaymentProvider
}

export function TransactionHistory({
  transactions,
}: {
  transactions: Transaction[]
}) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
        />
      ))}
    </div>
  )
}
```

## Form Components

### 1. AmountInput

```typescript
// modules/shared/components/payments/forms/amount-input.tsx
interface AmountInputProps {
  value: number
  onChange: (value: number) => void
  currency?: string
  min?: number
  max?: number
}

export function AmountInput({
  value,
  onChange,
  currency = "NGN",
  min = 100,
  max = 1000000,
}: AmountInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {currency}
      </span>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="pl-12"
        min={min}
        max={max}
      />
    </div>
  )
}
```

### 2. PaymentSummary

```typescript
// modules/shared/components/payments/elements/payment-summary.tsx
interface PaymentSummaryProps {
  subtotal: number
  fees: number
  total: number
  currency?: string
}

export function PaymentSummary({
  subtotal,
  fees,
  total,
  currency = "NGN",
}: PaymentSummaryProps) {
  return (
    <div className="rounded-lg bg-muted p-4">
      <dl className="space-y-2">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatCurrency(subtotal, currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Processing Fee</dt>
          <dd>{formatCurrency(fees, currency)}</dd>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-medium">
          <dt>Total</dt>
          <dd>{formatCurrency(total, currency)}</dd>
        </div>
      </dl>
    </div>
  )
}
```

## Feedback Components

### 1. PaymentStatus

```typescript
// modules/shared/components/payments/feedback/payment-status.tsx
interface PaymentStatusProps {
  status: PaymentStatus
  message?: string
}

export function PaymentStatus({
  status,
  message,
}: PaymentStatusProps) {
  const statusConfig = {
    success: {
      icon: CheckCircleIcon,
      color: "text-success",
      title: "Payment Successful",
    },
    pending: {
      icon: ClockIcon,
      color: "text-warning",
      title: "Payment Processing",
    },
    error: {
      icon: XCircleIcon,
      color: "text-error",
      title: "Payment Failed",
    },
  }

  const config = statusConfig[status]

  return (
    <div className={cn("rounded-lg p-4", `bg-${status}/10`)}>
      <div className="flex items-center gap-3">
        <config.icon className={cn("h-5 w-5", config.color)} />
        <div>
          <h4 className="font-medium">{config.title}</h4>
          {message && (
            <p className="text-sm text-muted-foreground mt-1">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
```

## Layout Components

### 1. PaymentLayout

```typescript
// modules/shared/components/payments/layouts/payment-layout.tsx
interface PaymentLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function PaymentLayout({
  children,
  sidebar,
}: PaymentLayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">{children}</div>
      {sidebar && (
        <div className="lg:col-span-1">{sidebar}</div>
      )}
    </div>
  )
}
```

## Animation & Transitions

```typescript
// modules/shared/components/payments/animations/payment-animations.ts
export const paymentAnimations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  },
}
```

## Loading States

### 1. PaymentProcessing

```typescript
// modules/shared/components/payments/loading/payment-processing.tsx
export function PaymentProcessing() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Spinner className="h-8 w-8 text-primary" />
      <h3 className="mt-4 font-medium">Processing Payment</h3>
      <p className="text-sm text-muted-foreground mt-2">
        Please don't close this window
      </p>
    </div>
  )
}
```

## Responsive Design

All components follow mobile-first approach with Tailwind breakpoints:

```typescript
// Common responsive patterns
const responsiveClasses = {
  container: "px-4 md:px-6 lg:px-8",
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  stack: "space-y-4 md:space-y-6 lg:space-y-8",
}
```

## Theme Integration

```typescript
// modules/shared/components/payments/theme/payment-theme.ts
export const paymentTheme = {
  light: {
    card: "bg-white border-gray-200",
    input: "bg-white border-gray-300",
    button: "bg-primary text-white hover:bg-primary/90",
  },
  dark: {
    card: "bg-gray-800 border-gray-700",
    input: "bg-gray-900 border-gray-700",
    button: "bg-primary text-white hover:bg-primary/90",
  },
}
```

## Accessibility Features

```typescript
// modules/shared/components/payments/a11y/payment-a11y.tsx
export const paymentA11y = {
  labels: {
    amount: "Payment Amount",
    cardNumber: "Card Number",
    expiryDate: "Expiry Date",
    cvv: "Security Code (CVV)",
  },
  descriptions: {
    amount: "Enter the amount you wish to pay",
    cardNumber: "Enter your 16-digit card number",
    expiryDate: "Enter the card expiry date in MM/YY format",
    cvv: "Enter the 3 or 4 digit security code",
  },
}
```
