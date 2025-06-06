# API Documentation

## Overview
UnibenServices API is built with Hono.js and follows REST principles. The API handles authentication, onboarding, bookings, payments, and service management.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://api.unibenservices.com/api`

## Authentication
All API requests must include a valid JWT token in the Authorization header:
```http
Authorization: Bearer <token>
```

## API Endpoints

### Authentication & Onboarding
```typescript
POST /api/onboarding/register         // Student or provider registration (userType, matricNumber, providerCategory, etc.)
POST /api/onboarding/verification-doc // Upload verification document (studentIdCardUrl or providerVerificationDocs)
POST /api/auth/login                  // Login
POST /api/auth/verify-email           // Email verification
```

### Services
```typescript
GET /api/services
GET /api/services/:id
POST /api/services
PUT /api/services/:id
DELETE /api/services/:id
```

### Bookings
```typescript
GET /api/bookings
POST /api/bookings
GET /api/bookings/:id
PUT /api/bookings/:id/status
```

### Payments
```typescript
POST /api/payments/initialize
POST /api/payments/verify
GET /api/payments/history
```

## Error Handling
The API uses standard HTTP status codes and returns errors in the following format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Rate Limiting
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Webhooks
Webhook endpoints for payment providers:
```typescript
POST /api/webhooks/paystack
POST /api/webhooks/flutterwave
```

## API Versioning
All endpoints are currently under `/api/` (no version prefix yet).

## Testing
Test endpoints with provided Postman collection:
`/docs/postman/uniben-services.postman_collection.json`
