---
applyTo: "**"
---

# Authentication & User Roles Setup for UNIBEN Student Services Platform

## Overview
This document outlines the authentication setup and user roles for our student services marketplace platform.

## User Roles

### 1. Student Users
- Role identifier: `student`
- Authentication requirements:
  - Registration with any valid email
  - Matriculation Number verification
  - Student ID Card upload and verification
- Permissions:
  - Book services
  - Rate service providers
  - View service history
  - Manage personal profile
  - Submit support tickets

### 2. Service Providers
- Role identifier: `provider`
- Authentication requirements:
  - Email verification
  - Phone number verification
  - Required documentation upload
- Permissions:
  - Create service listings
  - Manage availability calendar
  - Accept/reject bookings
  - View earnings dashboard
  - Update service pricing
  - Respond to reviews

### 3. Admin Users
- Role identifier: `admin`
- Authentication requirements:
  - Two-factor authentication mandatory
  - Strong password policy
- Permissions:
  - Manage all users
  - Verify service providers
  - Handle disputes
  - Access analytics
  - Manage platform settings

## Implementation Guide

### 1. Database Schema Updates
Update `packages/database/prisma/schema.prisma`:
```prisma
enum UserRole {
  STUDENT
  PROVIDER
  ADMIN
}

model User {
  // ...existing fields
  role              UserRole    @default(STUDENT)
  matriculationNumber String?     // For student registration, to be verified
  studentIdCardUrl  String?     // URL to uploaded student ID card
  isStudentVerified Boolean     @default(false) // Tracks student-specific verification
  isVerified        Boolean     @default(false) // General email verification
  documents         Document[]  // For provider verification
}

model Document {
  id          String   @id @default(cuid())
  userId      String
  type        String   // ID_CARD, PROVIDER_LICENSE, etc.
  status      String   // PENDING, VERIFIED, REJECTED
  url         String
  uploadedAt  DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

### 2. Authentication Flow

#### Student Registration
1. Sign up with any valid email
2. Email verification (standard)
3. Provide Matriculation Number
4. Upload Student ID Card
5. Admin/automated verification of Matriculation Number and ID Card
6. Profile completion

#### Service Provider Registration
1. Basic sign up
2. Document upload
3. Admin verification
4. Profile completion

### 3. Security Measures

- Rate limiting on authentication endpoints
- Session management with automatic timeout
- IP-based blocking for suspicious activities
- Document verification workflow
- Two-factor authentication for admin accounts

## Integration with better-auth

Update the auth configuration in `packages/auth/auth.ts`:

```typescript
export const auth = betterAuth({
  // ...existing config
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        validate: (value) => ["STUDENT", "PROVIDER", "ADMIN"].includes(value),
      },
      matriculationNumber: {
        type: "string",
        required: false,
      },
      studentIdCardUrl: {
        type: "string",
        required: false,
      },
      isStudentVerified: {
        type: "boolean",
        required: true,
        default: false,
      },
      isVerified: {
        type: "boolean",
        required: true,
        default: false,
      },
    },
  },
  hooks: {
    // Add role-based access control
    beforeAuth: async (ctx) => {
      // Role-based route protection
    },
  },
});
```

## Role-Based Access Control (RBAC)

Implement RBAC middleware in `packages/api/src/middleware/auth.ts`:

```typescript
export const requireRole = (allowedRoles: UserRole[]) => {
  return async (ctx: ApiContext) => {
    const user = await auth.getUserFromRequest(ctx.request);
    if (!user || !allowedRoles.includes(user.role)) {
      throw new UnauthorizedError("Insufficient permissions");
    }
  };
};
```

## Frontend Implementation

1. Protected Routes:
   - Use middleware for role-based route protection
   - Implement role-specific layouts and navigation

2. Role-Specific Features:
   - Student dashboard
   - Provider management interface
   - Admin control panel

## Testing

1. Unit Tests:
   - Role-based access control
   - Authentication flows
   - Document verification

2. Integration Tests:
   - Complete registration flows
   - Role transitions
   - Permission checks

## Security Considerations

1. Data Protection:
   - Encrypt sensitive user data
   - Implement proper session management
   - Regular security audits

2. Compliance:
   - GDPR compliance
   - University data protection policies
   - Local regulations

## API Specifications

### Authentication Endpoints

#### 1. Student Registration
```typescript
POST /api/auth/register/student
Content-Type: application/json

{
  "email": string,     // Any valid email
  "password": string,  // Min 8 chars, 1 uppercase, 1 number
  "name": string,
  "matriculationNumber": string,
  "department": string,
  "level": number
  // Student ID card will be uploaded in a separate step after initial registration
}

Response: {
  "userId": string,
  "email": string,
  "role": "STUDENT",
  "message": "Registration successful, please verify your email and complete student verification."
}
```

#### 2. Service Provider Registration
```typescript
POST /api/auth/register/provider
Content-Type: application/json

{
  "email": string,
  "password": string,
  "name": string,
  "phone": string,
  "businessName": string,
  "serviceCategories": string[]
}

Response: {
  "userId": string,
  "email": string,
  "role": "PROVIDER",
  "verificationToken": string
}
```

#### 3. Email Verification
```typescript
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": string
}

Response: {
  "verified": boolean,
  "userId": string
}
```

#### 4. Login
```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": string,
  "password": string
}

Response: {
  "session": {
    "userId": string,
    "role": "STUDENT" | "PROVIDER" | "ADMIN",
    "token": string,
    "expiresAt": string
  }
}
```

#### 5. Student ID Card Upload (New Endpoint)
```typescript
POST /api/auth/student/upload-id
Authorization: Bearer <session_token>
Content-Type: multipart/form-data

{
  "idCardFile": File // The student ID card image file
}

Response: {
  "userId": string,
  "idCardUrl": string, // URL of the uploaded ID card in Supabase Storage
  "verificationStatus": "PENDING_ADMIN_REVIEW"
}
```

#### 6. Document Upload (Service Provider)
```typescript
POST /api/auth/provider/documents
Authorization: Bearer <session_token> // Ensure provider is authenticated
Content-Type: multipart/form-data

{
  "documentType": "ID_CARD" | "PROVIDER_LICENSE" | "BUSINESS_REG",
  "file": File
}

Response: {
  "documentId": string,
  "status": "PENDING",
  "uploadedAt": string
}
```

#### 7. Profile Management
```typescript
PUT /api/auth/profile
Authorization: Bearer <session_token>
Content-Type: application/json

{
  "name": string,
  "phone"?: string,
  "department"?: string,
  "level"?: number,
  "avatar"?: string
}

Response: {
  "userId": string,
  "profile": {
    ...updatedFields
  }
}
```

### Authentication Middleware

#### Role-Based Route Protection
```typescript
// Route protection middleware
export const withAuth = (allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.getSession(req);
    
    if (!session || !allowedRoles.includes(session.role)) {
      throw new UnauthorizedError();
    }
    
    return next();
  };
};

// Usage example
app.get("/api/admin/dashboard", 
  withAuth(["ADMIN"]),
  adminDashboardHandler
);
```

### Error Responses

```typescript
// 401 Unauthorized
{
  "error": {
    "code": "unauthorized",
    "message": "Invalid credentials or insufficient permissions"
  }
}

// 403 Forbidden
{
  "error": {
    "code": "forbidden",
    "message": "Account not verified or lacking required role"
  }
}

// 422 Validation Error
{
  "error": {
    "code": "validation_error",
    "message": "Invalid input data",
    "details": {
      "field": ["error_message"]
    }
  }
}
```

### WebSocket Events for Real-time Updates

```typescript
// Authentication status events
interface AuthEvent {
  type: "AUTH_STATUS_CHANGE";
  payload: {
    userId: string;
    status: "LOGGED_IN" | "LOGGED_OUT" | "SESSION_EXPIRED";
    timestamp: string;
  }
}

// Student Verification Events (New)
interface StudentVerificationEvent {
  type: "STUDENT_VERIFICATION_STATUS_CHANGE";
  payload: {
    userId: string;
    matriculationNumber: string;
    status: "VERIFIED" | "REJECTED" | "PENDING_REVIEW";
    reason?: string;
    timestamp: string;
  }
}

// Document verification events
interface VerificationEvent {
  type: "DOCUMENT_STATUS_CHANGE";
  payload: {
    userId: string;
    documentId: string;
    status: "VERIFIED" | "REJECTED";
    reason?: string;
  }
}
```

## Development Guidelines

1. Always use TypeScript for type safety
2. Implement proper error handling
3. Log all authentication events
4. Document API changes
5. Follow security best practices
6. Validate all input data
7. Implement rate limiting for auth endpoints
8. Use proper HTTP status codes
9. Maintain comprehensive API documentation
