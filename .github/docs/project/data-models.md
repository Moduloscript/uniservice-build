# Database Schema & Models

## Overview
UnibenServices uses Supabase (PostgreSQL) with Prisma as the ORM. All users are stored in a single `User` model with a `userType` (STUDENT, PROVIDER, ADMIN) and fields for verification, onboarding, and provider/student-specific data.

## Core Models

### User
```prisma
model User {
  id                 String   @id
  name               String
  email              String   @unique
  emailVerified      Boolean
  username           String?  @unique
  role               String?
  userType           UserType?
  matricNumber       String?  @unique
  department         String?
  level              Int?
  isStudentVerified  Boolean  @default(false)
  isVerified         Boolean  @default(false)
  studentIdCardUrl   String?
  providerCategory   String?
  providerVerificationDocs Json?
  verificationStatus VerificationStatus? @default(PENDING)
  verificationNotes  String?
  verificationReviewedAt DateTime?
  verificationReviewedBy String?
  onboardingComplete Boolean  @default(false)
  // ...other fields and relations
}
```

### ServiceCategory
```prisma
model ServiceCategory {
  id          String   @id
  name        String   @unique
  description String?
  services    Service[]
}
```

### Service
```prisma
model Service {
  id          String   @id
  name        String
  description String
  categoryId  String
  category    ServiceCategory @relation(fields: [categoryId], references: [id])
  price       Decimal
  duration    Int
  providerId  String
  provider    User     @relation("ProviderServices", fields: [providerId], references: [id])
  bookings    Booking[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  isActive    Boolean  @default(true)
}
```

### Booking
```prisma
model Booking {
  id          String   @id
  studentId   String
  student     User     @relation("StudentBookings", fields: [studentId], references: [id])
  providerId  String
  provider    User     @relation("ProviderBookings", fields: [providerId], references: [id])
  serviceId   String
  service     Service  @relation(fields: [serviceId], references: [id])
  status      BookingStatus @default(PENDING)
  dateTime    DateTime
  payment     Payment?
  review      Review?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Payment
```prisma
model Payment {
  id              String   @id
  amount          Decimal
  currency        String   @default("NGN")
  status          PaymentStatus
  provider        PaymentProvider
  transactionRef  String   @unique
  paymentMethod   String
  bookingId       String   @unique
  booking         Booking  @relation(fields: [bookingId], references: [id])
  providerId      String
  escrowStatus    EscrowStatus?
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### PayoutAccount
```prisma
model PayoutAccount {
  id              String   @id
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  provider        PaymentProvider
  accountNumber   String
  accountName     String
  bankCode        String
  bankName        String
  isDefault       Boolean  @default(false)
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Review
```prisma
model Review {
  id        String   @id
  rating    Int
  comment   String?
  bookingId String   @unique
  booking   Booking  @relation(fields: [bookingId], references: [id])
  authorId  String
  author    User     @relation("ReviewAuthor", fields: [authorId], references: [id])
  targetId  String
  target    User     @relation("ReviewTarget", fields: [targetId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Database Security

### Row Level Security (RLS)
Supabase RLS policies are implemented for each table:

1. Students can only view their own profile
2. Service providers can only modify their own services
3. Public can view active services
4. Reviews are read-only after submission

### Indexes
Important indexes for performance:
```sql
CREATE INDEX idx_service_category ON services(category);
CREATE INDEX idx_booking_date ON bookings(dateTime);
CREATE INDEX idx_provider_rating ON service_providers(rating);
```

## Migrations
- All migrations are stored in `packages/database/prisma/migrations`
- Use `pnpm prisma migrate dev` for development
- Use `pnpm prisma migrate deploy` for production

## Backup Strategy
1. Daily automated backups
2. Point-in-time recovery enabled
3. Manual backup before major changes

## Performance Considerations
1. Use connection pooling in production
2. Implement caching for frequently accessed data
3. Use pagination for large result sets
4. Optimize queries with proper indexing

## Data Privacy
1. Encrypt sensitive information
2. Implement data retention policies
3. Follow GDPR compliance guidelines
4. Regular security audits