# Development Setup Guide

## Prerequisites

- Node.js 18+ (LTS recommended)
- PNPM 8+
- Git
- VS Code (recommended)
- Supabase CLI
- Docker (for local development)

## Initial Setup

1. **Clone the Repository**
```bash
git clone https://github.com/your-org/unibenservices.git
cd unibenservices
```

2. **Install Dependencies**
```bash
pnpm install
```

3. **Environment Configuration**

Copy the example environment files:
```bash
cp .env.example .env
```

Required environment variables:
```env
# Database
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# Supabase
SUPABASE_URL="your-project-url"
SUPABASE_ANON_KEY="your-anon-key"

# Email (Resend)
RESEND_API_KEY="re_..."

# Payments
PAYSTACK_SECRET_KEY="sk_..."
PAYSTACK_PUBLIC_KEY="pk_..."
FLUTTERWAVE_SECRET_KEY="FLWSECK_..."
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_..."

# Storage
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
```

4. **Database Setup**
```bash
# Start local Supabase
pnpm supabase start

# Push schema to database
pnpm db:push

# Generate Prisma client
pnpm db:generate
```

5. **Start Development Server**
```bash
pnpm dev
```

## Project Structure

```
apps/
  web/              # Main Next.js application
    modules/        # Feature modules
    public/         # Static assets
    
packages/
  api/             # API routes
  auth/            # Authentication
  database/        # Database schema & migrations
  payments/        # Payment processing
  storage/         # File storage
```

## Development Workflow

### 1. Branch Strategy
- `main` - Production branch
- `develop` - Development branch
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`
- Hotfixes: `hotfix/issue-description`

### 2. Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```bash
feat: add payment integration
fix: resolve booking confirmation issue
docs: update API documentation
style: format payment form
refactor: improve error handling
test: add payment validation tests
chore: update dependencies
```

### 3. Code Quality

Run linting:
```bash
pnpm lint
```

Type checking:
```bash
pnpm type-check
```

Format code:
```bash
pnpm format
```

### 4. Testing

Run tests:
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Watch mode
pnpm test:watch
```

## Local Development Tools

### 1. Database Management
```bash
# Reset database
pnpm db:reset

# Apply migrations
pnpm db:migrate

# Generate new migration
pnpm db:migrate:dev
```

### 2. Supabase Local Development
```bash
# Start Supabase
pnpm supabase start

# Stop Supabase
pnpm supabase stop

# View logs
pnpm supabase logs
```

### 3. Email Testing
```bash
# Start email preview
pnpm email:dev
```

## Debugging

### 1. API Routes
- Use VS Code debugger configuration
- Check API logs in development
- Use Thunder Client/Postman collections

### 2. Database
- Use Supabase Dashboard
- Check Prisma Studio: `pnpm prisma studio`
- Monitor database logs

### 3. Payment Integration
- Use test cards for Paystack/Flutterwave
- Monitor webhook endpoints
- Check payment logs

## Performance Optimization

1. **Bundle Analysis**
```bash
pnpm analyze:bundle
```

2. **Image Optimization**
```bash
pnpm optimize:images
```

## Deployment

### 1. Production Build
```bash
pnpm build
```

### 2. Preview Build
```bash
pnpm preview
```

## Troubleshooting

### Common Issues

1. **Database Connection**
- Check DATABASE_URL in .env
- Verify Supabase is running
- Check firewall settings

4. **Redis & Workers**
- Verify Redis connection settings in .env
- For serverless deployments, set ENABLE_WORKERS=false
- For local development with workers:
  ```bash
  # Terminal 1: Run app without workers
  ENABLE_WORKERS=false pnpm dev
  
  # Terminal 2: Run workers separately
  pnpm --filter @repo/api worker:dev
  ```

2. **Build Errors**
- Clear .next directory
- Update dependencies
- Check TypeScript errors

3. **Payment Testing**
- Use test API keys
- Check webhook configuration
- Monitor payment logs

## VS Code Configuration

### Recommended Extensions

1. **Core Extensions**
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "biomejs.biome"
  ]
}
```

2. **Workspace Settings**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Local Development Setup

### 1. Database Setup

```bash
# Start Supabase
pnpm supabase start

# Apply migrations
pnpm prisma migrate dev

# Seed initial data
pnpm prisma db seed
```

### 2. Authentication Setup

1. Configure Better-auth
```typescript
// packages/auth/config.ts
export const authConfig = {
  providers: [
    {
      id: 'student',
      type: 'credentials',
      verify: async (credentials) => {
        // Student verification logic
      }
    },
    {
      id: 'service-provider',
      type: 'credentials',
      verify: async (credentials) => {
        // Service provider verification logic
      }
    }
  ]
}
```

2. Set up verification endpoints
```typescript
// apps/web/app/api/auth/verify/route.ts
import { createVerificationHandler } from '@/packages/auth'

export const POST = createVerificationHandler({
  onVerify: async (data) => {
    // Verification logic
  }
})
```

### 3. Payment Provider Setup

1. Configure Paystack
```typescript
// packages/payments/src/providers/paystack.ts
import { Paystack } from 'paystack-sdk'

export const paystackClient = new Paystack({
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY
})
```

2. Configure Flutterwave
```typescript
// packages/payments/src/providers/flutterwave.ts
import { Flutterwave } from 'flutterwave-node'

export const flutterwaveClient = new Flutterwave({
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY
})
```

### 4. Storage Setup

1. Configure Supabase Storage
```typescript
// packages/storage/src/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Configure storage buckets
const buckets = [
  'profile-photos',
  'verification-docs',
  'service-images'
]

for (const bucket of buckets) {
  await supabase.storage.createBucket(bucket, {
    public: false
  })
}
```

### 5. Email Setup

1. Configure Resend
```typescript
// packages/mail/src/client.ts
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
```

2. Set up email templates
```typescript
// packages/mail/emails/welcome.tsx
import { EmailTemplate } from '../components/email-template'

export const WelcomeEmail = ({ 
  name,
  role 
}: {
  name: string
  role: 'student' | 'provider'
}) => (
  <EmailTemplate>
    <h1>Welcome to UnibenServices, {name}!</h1>
    {/* Email content */}
  </EmailTemplate>
)
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/feature-name

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm type-check
```

### 2. Database Changes

```bash
# Create migration
pnpm prisma migrate dev --name feature-name

# Apply migration
pnpm prisma migrate deploy

# Generate client
pnpm prisma generate
```

### 3. API Development

```bash
# Generate API types
pnpm api:generate

# Start API in development
pnpm api:dev

# Test API endpoints
pnpm api:test
```

## Additional Resources

1. Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

2. API References
- [Payment API Documentation](./api/payments)
- [Storage API Documentation](./api/storage)
- [Authentication API Documentation](./api/auth)

3. Example Implementation
- [Example Components](./examples)
- [API Routes Examples](./examples/api)
- [Test Examples](./examples/tests)