# Authentication System

## Overview
UnibenServices uses Better-auth for authentication, with custom flows for student verification and service provider validation.

## Authentication Flows

### Student Registration
1. Student fills registration form with:
   - Name
   - Email
   - Matriculation Number
   - Department
   - Level
   - Password

2. Verification Process:
   - Email verification
   - Matriculation number validation
   - ID card upload and verification

### Service Provider Registration
1. Provider fills registration form with:
   - Business/Individual Name
   - Email
   - Service Category
   - Contact Information
   - Password

2. Verification Process:
   - Email verification
   - Business documentation upload
   - Category-specific verification requirements

## Implementation

### Middleware
```typescript
// Authentication Middleware
import { withAuth } from '@/packages/auth'

export const authMiddleware = withAuth({
  publicRoutes: ['/login', '/register'],
  authenticatedRoutes: ['/dashboard', '/bookings'],
  verificationRequired: ['/provider/services']
})
```

### Protected Routes
```typescript
// Role-based Access Control
import { withRole } from '@/packages/auth'

export const providerRoutes = withRole({
  role: 'provider',
  redirectTo: '/login'
})
```

## Security Measures

### Password Security
- Bcrypt hashing
- Password strength requirements
- Rate limiting on attempts

### Session Management
- JWT tokens with short expiry
- Refresh token rotation
- Secure cookie handling

### Two-Factor Authentication
- Optional 2FA for providers
- Email verification codes
- Time-based OTP support

## Error Handling

### Common Authentication Errors
1. Invalid credentials
2. Expired sessions
3. Unauthorized access
4. Verification required

## Testing

### Authentication Tests
```typescript
describe('Authentication', () => {
  test('Student Registration', async () => {
    // Test implementation
  })
  
  test('Provider Verification', async () => {
    // Test implementation
  })
})
```
