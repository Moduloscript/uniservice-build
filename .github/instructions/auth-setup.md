---
applyTo: "**"
---

# Authentication & User Roles Setup for UNIBEN Student Services Platform

## Overview
This document describes the authentication and user roles as implemented in the codebase for the UnibenServices platform.

## User Roles (as in codebase)
- `STUDENT`: Registers with email, matricNumber, department, level, uploads studentIdCardUrl. Can book services, rate providers, manage profile.
- `PROVIDER`: Registers with email, business info, providerCategory, uploads providerVerificationDocs. Can create/manage services, accept bookings, manage payouts.
- `ADMIN`: Has platform-wide permissions, can verify users, manage disputes, access analytics.

## Database Schema (Prisma)
- All roles and verification fields are on the `User` model:
  - `userType: UserType?` (enum: STUDENT, PROVIDER, ADMIN)
  - `matricNumber: String? @unique` (for students)
  - `department: String?`, `level: Int?` (for students)
  - `studentIdCardUrl: String?` (for students)
  - `isStudentVerified: Boolean @default(false)`
  - `isVerified: Boolean @default(false)`
  - `providerCategory: String?` (for providers)
  - `providerVerificationDocs: Json?` (for providers)
  - `verificationStatus: VerificationStatus? @default(PENDING)`
  - `verificationNotes: String?`, `verificationReviewedAt: DateTime?`, `verificationReviewedBy: String?`

## Authentication Flow (as implemented)

### Student Registration
1. `POST /api/onboarding/register` (with userType: STUDENT, matricNumber, department, level, etc.)
2. `POST /api/onboarding/verification-doc` (upload student ID card, sets studentIdCardUrl)
3. Admin reviews and updates verificationStatus.

### Service Provider Registration
1. `POST /api/onboarding/register` (with userType: PROVIDER, providerCategory, providerDocs, etc.)
2. `POST /api/onboarding/verification-doc` (upload provider verification docs, sets providerVerificationDocs)
3. Admin reviews and updates verificationStatus.

### Login
- Standard login via email/password or social login (as configured in better-auth).

### Email Verification
- Handled by better-auth hooks and email templates.

## API Endpoints (actual)
- `POST /api/onboarding/register` — Handles both student and provider onboarding, sets all relevant fields.
- `POST /api/onboarding/verification-doc` — Handles document uploads for both students and providers.
- `GET /api/auth/session` — Returns current session/user info.
- `POST /api/auth/login` — Standard login.
- `POST /api/auth/logout` — Logout.
- `POST /api/auth/verify-email` — Email verification.

## Role-Based Access Control (RBAC)
- Middleware and helpers enforce role checks in API routes (see `packages/api/src/middleware/auth.ts`).
- Use `userType` and `role` fields for access checks.

## Admin Verification
- Admins can view and update user verification status and notes via admin routes (see `packages/api/src/routes/admin/verification-docs.ts`).

## Frontend Implementation
- Onboarding forms for students and providers are in `apps/web/modules/shared/components/onboarding-form.tsx`.
- Auth context/hooks use the session API and better-auth client.
- Role-based UI and navigation are implemented based on `userType` and verification status.

## Testing
- Unit and integration tests cover registration, onboarding, document upload, and admin verification flows.
- E2E tests for registration and onboarding are recommended.

## Security
- All sensitive fields are validated and protected by middleware.
- File uploads are validated and stored securely.
- Rate limiting and session management are enforced.

## Error Handling
- API returns standard HTTP status codes and error messages.
- Validation errors are returned with field-level details.

## Summary
- Always use the field names, endpoints, and flows as implemented in the codebase and schema.
- Update this document if the codebase changes to avoid confusion.
