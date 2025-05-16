# Database Schema & Models

## Overview
UnibenServices uses Supabase as the primary database with Prisma as the ORM. This document outlines the database schema, relationships, and important considerations.

## Core Models

### Student
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
  verified      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### ServiceProvider
```prisma
model ServiceProvider {
  id            String    @id
  name          String
  email         String    @unique
  services      Service[]
  availability  Slot[]
  reviews       Review[]
  verified      Boolean   @default(false)
  rating        Float?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Service
```prisma
model Service {
  id          String   @id
  name        String
  description String
  category    String
  price       Decimal
  duration    Int
  provider    ServiceProvider @relation(fields: [providerId], references: [id])
  providerId  String
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
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