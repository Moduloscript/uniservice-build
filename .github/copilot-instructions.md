
---
applyTo: "**"
---


# UnibenServices - Student Service Marketplace

## Project Overview
A marketplace platform connecting University of Benin students with service providers and student entrepreneurs.

## Tech Stack (Based on existing codebase)
- Next.js 15+ (App Router)
- TypeScript
- Supabase (Database & Storage)
- Prisma (Database ORM)
- Hono (API Framework)
- Tailwind CSS + Shadcn UI
- Better-auth for Authentication
- Resend (Email Provider)
- Paystack & Flutterwave (Payment Providers)
- PNPM Workspaces

## Core Features

### 1. Authentication & User Roles
- Student Authentication (Matriculation Number & ID Card Verification)
- Service Provider Authentication (General and Category-Specific Verification)
- Admin Dashboard
- Role-based access control

### 2. Service Categories
- Academic Services (tutoring, project help)
- Personal Services (laundry, cleaning)
- Food & Delivery
- Beauty & Wellness
- Tech Support
- Event Services

### 3. Booking System
- Real-time availability
- Scheduling system
- Payment integration
- Booking management

### 4. Profile Management
- Student profiles
- Service provider profiles
- Portfolio/Services showcase
- Ratings & Reviews

### 5. Search & Discovery
- Category-based browsing
- Location-based search
- Filter by price, rating, availability
- Student recommendations

### 6. Chat & Communication
- In-app messaging
- Booking notifications
- Service status updates

### 7. Payment System
- Multi-provider payment processing (Paystack & Flutterwave)
- Split payments for service providers
- Escrow system for service completion
- Payment dispute resolution
- Service provider payouts
- Transaction history and analytics
- Payment method management
- Automatic reconciliation
- Revenue sharing model
- Student payment verification

## Project Structure

```
apps/
  web/              # Main web application
    modules/
      student/      # Student-specific features
      provider/     # Service provider features
      bookings/     # Booking management
      chat/         # Messaging system
      payments/     # Payment processing
      
packages/
  auth/             # Authentication & authorization
  database/         # Prisma schema & migrations
  payments/         # Payment processing logic
  storage/          # File storage (profile pictures, etc.)
  api/              # API routes and endpoints
```

## Data Models (Prisma Schema)

```prisma
model Student {
  id            String    @id
  matricNumber  String    @unique
  email         String    @unique
  name          String
  department    String
  level         Int
  bookings      Booking[]
  reviews       Review[]
}

model ServiceProvider {
  id          String    @id
  name        String
  services    Service[]
  availability Slot[]
  reviews     Review[]
}

model Service {
  id          String   @id
  name        String
  category    String
  price       Decimal
  duration    Int
  provider    ServiceProvider @relation(fields: [providerId], references: [id])
  providerId  String
}

model Booking {
  id          String   @id
  student     Student  @relation(fields: [studentId], references: [id])
  service     Service  @relation(fields: [serviceId], references: [id])
  status      String
  dateTime    DateTime
  payment     Payment?
}

model Payment {
  id              String    @id
  amount          Decimal
  currency        String    @default("NGN")
  status          PaymentStatus
  provider        PaymentProvider
  transactionRef  String    @unique
  paymentMethod   String
  booking         Booking   @relation(fields: [bookingId], references: [id])
  bookingId       String    @unique
  providerId      String
  escrowStatus    EscrowStatus?
  metadata        Json?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model PayoutAccount {
  id              String    @id
  provider        PaymentProvider
  accountNumber   String
  accountName     String
  bankCode        String
  bankName        String
  serviceProvider ServiceProvider @relation(fields: [providerId], references: [id])
  providerId      String
  isDefault       Boolean   @default(false)
  metadata        Json?
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  DISPUTED
}

enum PaymentProvider {
  PAYSTACK
  FLUTTERWAVE
}

enum EscrowStatus {
  HELD
  RELEASED
  REFUNDED
}
```

## Development Guidelines

1. **API Routes with Hono**
   - Use Hono's type-safe routing and middleware
   - Follow RESTful conventions
   - Implement built-in validation with Hono's validators
   - Use Hono's built-in error handling
   - Leverage Hono's performance optimizations for edge computing
   - Utilize Hono's RPC client for type-safe API calls

2. **Authentication**
   - Use existing better-auth setup
   - Implement Matriculation Number and Student ID card verification process for students.
   - Design and implement general and category-specific verification workflows for service providers.
   - Handle role-based access control

3. **Frontend Components**
   - Use Atomic Design principles
   - Implement responsive designs
   - Follow accessibility guidelines

4. **State Management**
   - Use React Query for server state
   - Implement proper loading states
   - Handle error boundaries

5. **Testing**
   - Write unit tests for critical paths
   - Implement E2E tests for core flows
   - Test across different devices

## Getting Started

1. Clone the repository
2. Install dependencies: \`pnpm install\`
3. Copy \`.env.example\` to \`.env\`
4. Set up your local database
5. Run migrations: \`pnpm db:push\`
6. Start development: \`pnpm dev\`

## Contribution Guidelines

1. Branch naming: \`feature/feature-name\` or \`fix/issue-description\`
2. Commit messages: Follow conventional commits
3. Create PRs with proper descriptions
4. Ensure tests pass before merging

## Payment Configuration

1. **Payment Providers Setup**
   - Paystack Integration:
     - Standard checkout
     - Split payments for service providers
     - Recurring payments
     - Transaction webhooks
     - Payment verification
   
   - Flutterwave Integration:
     - Standard checkout
     - Virtual accounts
     - Payment plans
     - Refund handling
     - Settlement webhooks

2. **Environment Variables**
   ```
   # Paystack Configuration
   PAYSTACK_SECRET_KEY="sk_xxx"
   PAYSTACK_PUBLIC_KEY="pk_xxx"
   PAYSTACK_MERCHANT_EMAIL="merchant@example.com"
   
   # Flutterwave Configuration
   FLUTTERWAVE_SECRET_KEY="FLWSECK_xxx"
   FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_xxx"
   FLUTTERWAVE_ENCRYPTION_KEY="FLWENCRYPTION_xxx"
   ```

3. **Payment Features**
   - Multi-provider fallback
   - Split payments for marketplace
   - Transaction history
   - Payment dispute handling
   - Auto-reconciliation
   - Service provider payouts

4. **Security Best Practices**
   - Webhook signature verification
   - Payment data encryption
   - Transaction logging
   - Error handling and retries
   - Fraud prevention measures

## Security Considerations

1. Implement rate limiting
2. Secure student verification document handling (ID cards, etc.)
3. Secure payment processing
4. Handle file uploads safely, including provider verification documents for various categories.
5. Implement proper session management

## Email Configuration (Resend)

1. **Email Templates**
   - Service booking confirmations
   - Provider notifications
   - Account verification emails
   - Password reset emails
   - Student onboarding sequences
   - Rating and review reminders

2. **Email Security**
   - SPF and DKIM setup
   - Email validation
   - Anti-spam compliance
   - Rate limiting for email sending

3. **Integration Guidelines**
   - Use environment variables for Resend API keys
   - Implement email queue system
   - Handle email bounce tracking
   - Monitor email delivery stats

## Supabase Configuration

1. **Database Setup**
   - PostgreSQL database configuration
   - Row Level Security (RLS) policies
   - Database connection pooling
   - Direct connection for Prisma migrations

2. **Storage Configuration**
   - Bucket setup for:
     - Student profile pictures
     - Service provider portfolios
     - Service verification documents
     - Chat attachments
   - Storage security policies
   - File upload restrictions
   - CDN optimization

3. **Environment Variables**
   ```
   DATABASE_URL=postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   DIRECT_URL=postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   S3_ACCESS_KEY_ID="your-access-key"
   S3_SECRET_ACCESS_KEY="your-secret-key"
   S3_ENDPOINT="https://[PROJECT-REF].supabase.co/storage/v1/s3"
   ```

4. **Security Best Practices**
   - RLS policies for data access
   - Storage bucket access control
   - API rate limiting
   - Secure file uploads validation

## Performance Guidelines

1. Optimize image loading
2. Implement proper caching
3. Use proper bundling strategies
4. Monitor API performance
5. Optimize database queries
6. Configure CDN for storage assets
7. Use lazy loading for non-critical components
8. Implement code splitting