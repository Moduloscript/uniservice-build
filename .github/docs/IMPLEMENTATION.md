# Implementation Guide

## Project Organization

### Core Packages Structure
```
packages/
  auth/             # Authentication & authorization (Better-auth config, helpers)
  database/         # Prisma schema & migrations
  payments/         # Payment processing logic (Paystack, Flutterwave)
  storage/          # File storage (profile pictures, verification docs)
  api/              # API routes (Hono)
```

### Development Setup

1. VS Code Extensions Required:
- Prisma (prisma.prisma)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Better Comments
- GitLens

2. VS Code Workspace Settings:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Implementation Workflow

1. Database Layer (packages/database)
   - Schema definition (single User model, Service, Booking, Payment, etc.)
   - Migrations
   - Type generation

2. API Layer (packages/api)
   - Hono routes setup
   - Middleware configuration (auth, RBAC)
   - Type-safe endpoints

3. Authentication (packages/auth)
   - Unified User model with userType, verification fields
   - Student and provider onboarding flows
   - Role-based access

4. Frontend Components (apps/web)
   - Page layouts
   - Shared components
   - Module-specific features (onboarding, profile, bookings, payments)

5. Payment Integration (packages/payments)
   - Provider setup (Paystack, Flutterwave)
   - Transaction flow
   - Webhook handling

## VS Code Tasks

Custom tasks are defined in `.vscode/tasks.json` for common development workflows:

1. Development
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Development",
      "type": "shell",
      "command": "pnpm dev",
      "problemMatcher": ["$tsc-watch"]
    }
  ]
}
```

2. Database
```json
{
  "label": "Database Migration",
  "type": "shell",
  "command": "pnpm db:migrate",
  "problemMatcher": []
}
```

## Debug Configurations

Debug configurations in `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "program": "${workspaceFolder}/packages/api/src/app.ts",
      "outFiles": ["${workspaceFolder}/packages/api/dist/**/*.js"]
    }
  ]
}
```

## Testing Strategy

1. Unit Tests
   - Components
   - API endpoints
   - Business logic

2. Integration Tests
   - API flows
   - Authentication
   - Payment processing

3. E2E Tests
   - Core user journeys
   - Cross-browser testing

## Code Implementation References

1. **Authentication Flow**
   - Location: `packages/auth/`
   - Key files:
     - `auth.ts` (Better-auth config)
     - `lib/` (helpers, RBAC)

2. **Payment Processing**
   - Location: `packages/payments/`
   - Key files:
     - `provider/paystack.ts`
     - `provider/flutterwave.ts`
     - `src/webhooks/handler.ts`

3. **API Routes**
   - Location: `packages/api/src/routes/`
   - Implementation pattern:
     ```typescript
     import { Hono } from 'hono';
     const router = new Hono();
     router.post('/onboarding/register', ...)
     ```

4. **Frontend Components**
   - Location: `apps/web/modules/`
   - Implementation pattern:
     ```typescript
     // Student dashboard component
     export function StudentDashboard() {
       // Implementation
     }
     ```
