# Architecture Overview

UnibenServices is a modular, monorepo-based platform built with:
- Next.js (App Router) for the frontend (apps/web)
- Hono.js for API routing (packages/api)
- Prisma ORM and Supabase (PostgreSQL) for the database (packages/database)
- Better-auth for authentication (packages/auth)
- Tailwind CSS and Shadcn UI for styling
- Payments via Paystack and Flutterwave (packages/payments)
- File storage via Supabase and S3-compatible providers (packages/storage)

## Key Principles
- All user types (students, providers, admins) are stored in a single User model with role and verification fields.
- API endpoints are implemented in Hono and follow REST conventions.
- State management and server state are handled with React Query on the frontend.
- Modular code organization: business logic is separated into packages, UI into atomic components.

## Main Folders
- `apps/web`: Next.js frontend
- `packages/api`: Hono API routes
- `packages/auth`: Auth config and helpers
- `packages/database`: Prisma schema, migrations, and types
- `packages/payments`: Payment provider logic
- `packages/storage`: File storage providers

// ...expand as needed for future architectural details
