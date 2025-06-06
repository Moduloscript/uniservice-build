# Authentication System

## Overview
UnibenServices uses Better-auth for authentication. All users are stored in a single `User` model with a `userType` (STUDENT, PROVIDER, ADMIN), and fields for verification and onboarding. Student and provider verification flows are handled via onboarding endpoints and document uploads.

## Authentication Flows

### Student Registration
1. Student fills registration form with:
   - name
   - email
   - password
   - matricNumber
   - department
   - level
2. Email verification is sent.
3. Student uploads ID card (`studentIdCardUrl`)
4. Admin reviews and verifies student status (`isStudentVerified`)

### Service Provider Registration
1. Provider fills registration form with:
   - name
   - email
   - password
   - providerCategory
   - phone (optional)
2. Email verification is sent.
3. Provider uploads required documents (`providerVerificationDocs`)
4. Admin reviews and verifies provider status (`verificationStatus`)

## Implementation

### Middleware
```typescript
import { requireRole } from '@repo/auth/lib/role';

// Example: Only allow providers
app.use('/provider', requireRole(['PROVIDER']));
```

### Protected Routes
```typescript
import { authMiddleware } from '@repo/auth';

app.use(authMiddleware);
```

## Security Measures
- Passwords are hashed (bcrypt)
- Email verification required
- Rate limiting on auth endpoints
- JWT session management
- 2FA for admins (if enabled)

## Error Handling
- Standard HTTP status codes
- JSON error format: `{ error: { code, message, details } }`

## Testing
- Unit tests for registration, login, and verification flows
- Integration tests for onboarding and document upload endpoints
- E2E tests for user journeys (registration, onboarding, admin review)
