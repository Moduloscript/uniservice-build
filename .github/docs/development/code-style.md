# Code Style Guide

## Core Principles

1. **Server-First Development**
- Use React Server Components by default
- Only use 'use client' when necessary
- Leverage Next.js App Router patterns

2. **Type Safety**
- Use TypeScript for all code
- Prefer interfaces over types for objects
- Use strict type checking

3. **Functional Programming**
- Use pure functions
- Avoid class components
- Embrace immutability

## File Organization

### Directory Structure
```
modules/
  feature-name/
    components/     # React components
    hooks/         # Custom hooks
    utils/         # Utility functions
    types/         # TypeScript types
    api/          # API routes
    tests/        # Unit and integration tests
```

### File Naming
```
components/
  user-profile/
    index.ts                  # Exports
    user-profile.tsx         # Main component
    user-profile.test.tsx    # Tests
    user-profile.types.ts    # Types
```

## TypeScript Usage

### Type Definitions
```typescript
// Interfaces for objects
interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

// Constants instead of enums
const UserRole = {
  STUDENT: 'student',
  PROVIDER: 'provider',
  ADMIN: 'admin',
} as const

type UserRole = typeof UserRole[keyof typeof UserRole]

// Strict null checks
type Maybe<T> = T | null | undefined
```

### Component Props
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  isLoading?: boolean
  children: React.ReactNode
}

function Button({ 
  variant = 'primary',
  isLoading,
  children,
  ...props 
}: ButtonProps) {
  // Implementation
}
```

## React Patterns

### Server Components
```typescript
// Default to Server Components
export function UserProfile({ userId }: { userId: string }) {
  // Server-side data fetching
  // No client-side state
  return (
    // JSX
  )
}

// Client Components when needed
'use client'

export function UserForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  // Client-side state and effects
}
```

### Data Fetching
```typescript
// Server Component data fetching
async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await fetchUser(params.id)
  return <UserProfile user={user} />
}

// Client-side data fetching with React Query
function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })
}
```

## Styling Conventions

### Tailwind Usage
```typescript
// Use cn utility for conditional classes
import { cn } from "@/lib/utils"

function Card({ className, children }: CardProps) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4",
      "hover:shadow-md transition-shadow",
      className
    )}>
      {children}
    </div>
  )
}
```

### Component Variants
```typescript
// Use cva for component variants
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)
```

## Error Handling

### API Error Pattern
```typescript
interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}

// Usage
try {
  await apiCall()
} catch (error) {
  if (isApiError(error)) {
    // Handle API error
  }
  // Handle unknown error
}
```

## Testing Guidelines

### Component Testing
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<Component />)
    await user.click(screen.getByRole('button'))
    // Assert expected behavior
  })
})
```

## Performance Best Practices

1. **Bundle Optimization**
- Use dynamic imports for large components
- Implement proper code splitting
- Optimize images and assets

2. **React Optimization**
```typescript
// Memoize expensive calculations
const memoizedValue = useMemo(() => 
  expensiveOperation(props),
  [props]
)

// Use Suspense boundaries
<Suspense fallback={<Loading />}>
  <ExpensiveComponent />
</Suspense>
```

3. **State Management**
- Use URL state with 'nuqs' for shareable state
- Prefer server state over client state
- Implement proper loading states

## Documentation

### Component Documentation
```typescript
/**
 * Displays user profile information with customizable styling
 *
 * @example
 * ```tsx
 * <UserProfile
 *   userId="123"
 *   className="mt-4"
 * />
 * ```
 */
```

### API Documentation
```typescript
/**
 * Fetches user data from the API
 * 
 * @param userId - The unique identifier of the user
 * @throws {ApiError} When the user is not found
 * @returns Promise resolving to user data
 */
```

## Hono API Patterns

### Route Structure
```typescript
// packages/api/src/routes/services.ts
import { Hono } from 'hono'
import { z } from 'zod'
import { validator } from '../middleware/validator'

const services = new Hono()

// Schema validation
const createServiceSchema = z.object({
  name: z.string().min(3),
  category: z.string(),
  price: z.number().positive()
})

services.post('/', validator('json', createServiceSchema), async (c) => {
  const data = c.req.valid('json')
  // Implementation
})

export { services }
```

### Error Handling
```typescript
import { ErrorHandler } from '@/packages/api/middleware'

// Use centralized error handler
app.onError(ErrorHandler)

// Consistent error responses
throw new HTTPException(400, {
  message: 'Invalid service data',
  cause: error
})
```

## Authentication Patterns

### Better-auth Integration
```typescript
// packages/auth/lib/user.ts
import { createAuthMiddleware } from '@better-auth/core'

export const authMiddleware = createAuthMiddleware({
  providers: ['student', 'service-provider'],
  callbacks: {
    async authorize({ provider, credentials }) {
      // Custom authorization logic
    }
  }
})
```

### Role-Based Access
```typescript
// modules/shared/auth/guards.ts
import { createRoleGuard } from '@/packages/auth'

export const requireStudent = createRoleGuard(['student'])
export const requireProvider = createRoleGuard(['service-provider'])
export const requireAdmin = createRoleGuard(['admin'])
```

## Component Architecture

### UI Component Structure
```typescript
// Prefer composition over inheritance
interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

// Use discriminated unions for complex states
type ButtonState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }

// Implement proper loading and error states
export function Button({ 
  variant = 'primary',
  size = 'md',
  state,
  children 
}: ButtonProps) {
  if (state.status === 'loading') {
    return <LoadingSpinner />
  }

  return (
    <button 
      className={cn(
        buttonVariants({ variant, size }),
        state.status === 'error' && 'border-red-500'
      )}
    >
      {children}
    </button>
  )
}
```

## State Management

### Server State
```typescript
// Use React Query for server state
export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await fetch('/api/services')
      if (!response.ok) throw new Error('Failed to fetch services')
      return response.json()
    }
  })
}
```

### Form State
```typescript
// Use Zod with React Hook Form
const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  service: z.string().uuid()
})

export function BookingForm() {
  const form = useForm({
    resolver: zodResolver(schema)
  })

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  )
}
```