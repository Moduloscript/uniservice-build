# Deployment Guide

## Overview

UnibenServices uses a multi-environment deployment strategy:
1. Development (Local)
2. Staging
3. Production

## Infrastructure

### Core Services
- Next.js Application → Vercel
- Database → Supabase
- File Storage → Supabase Storage
- Authentication → Better-auth + Supabase
- Emails → Resend
- Payments → Paystack & Flutterwave

## Environment Setup

### Environment Variables

```env
# Application
NEXT_PUBLIC_APP_URL="https://unibenservices.com"
NEXT_PUBLIC_API_URL="https://api.unibenservices.com"

# Database
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."

# Authentication
NEXTAUTH_URL="https://unibenservices.com"
NEXTAUTH_SECRET="your-secret"

# Supabase
SUPABASE_URL="your-project-url"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Storage
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET="your-bucket-name"
S3_REGION="your-region"

# Email (Resend)
RESEND_API_KEY="re_..."

# Payments
PAYSTACK_SECRET_KEY="sk_..."
PAYSTACK_PUBLIC_KEY="pk_..."
FLUTTERWAVE_SECRET_KEY="FLWSECK_..."
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_..."
```

## Deployment Process

### 1. Pre-deployment Checks

```bash
# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint

# Build check
pnpm build
```

### 2. Database Migration

```bash
# Generate migration
pnpm prisma migrate deploy

# Verify migration
pnpm prisma db seed
```

### 3. Deployment Commands

```bash
# Production build
pnpm build

# Start production server
pnpm start

# Analyze bundle
pnpm analyze
```

## Continuous Integration/Deployment

### GitHub Actions Workflow

```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm type-check
      
      - name: Run tests
        run: pnpm test
      
      - name: E2E tests
        run: pnpm test:e2e
        
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring & Logging

### Production Monitoring

#### Application Monitoring

1. **Error Tracking (Sentry)**
```typescript
// apps/web/app/sentry.client.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NEXT_PUBLIC_APP_ENV
})
```

2. **Performance Monitoring**
- Next.js Analytics Dashboard
- Custom metrics tracking
- Real User Monitoring (RUM)

3. **Log Management**
```typescript
// packages/logs/src/index.ts
import { createLogger } from './lib/logger'

export const logger = createLogger({
  service: 'unibenservices',
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'production' 
    ? 'datadog'
    : 'console'
})
```

#### Database Monitoring

1. **Supabase Metrics**
- Connection pool usage
- Query performance
- Slow query logs

2. **Prisma Metrics**
```typescript
// packages/database/src/index.ts
import { prisma } from './client'

prisma.$use(async (params, next) => {
  const start = Date.now()
  const result = await next(params)
  const end = Date.now()
  
  logger.info('prisma_query', {
    model: params.model,
    action: params.action,
    duration: end - start
  })
  
  return result
})
```

#### Payment System Monitoring

1. **Transaction Monitoring**
```typescript
// packages/payments/src/monitoring.ts
export const monitorTransaction = async (
  transactionId: string,
  provider: 'paystack' | 'flutterwave'
) => {
  const metrics = {
    attempt: 0,
    lastCheck: Date.now(),
    status: 'pending'
  }

  while (metrics.attempt < 5) {
    const status = await checkTransactionStatus(transactionId, provider)
    metrics.status = status
    
    if (status !== 'pending') {
      logger.info('payment_completed', {
        transactionId,
        provider,
        attempts: metrics.attempt,
        duration: Date.now() - metrics.lastCheck
      })
      break
    }
    
    metrics.attempt++
    await delay(5000)
  }
}
```

2. **Payment Analytics**
- Success/failure rates by provider
- Average transaction time
- Dispute rate monitoring

### 2. Database Monitoring

- Connection pool metrics
- Query performance
- Storage usage
- Backup status

### 3. Infrastructure Monitoring

- Server health
- API endpoints
- CDN status
- Storage metrics

## Backup Strategy

### Database Backups
```bash
# Automated daily backups
0 0 * * * pnpx supabase db dump -f backup-$(date +%Y%m%d).sql

# Backup verification
0 1 * * * ./scripts/verify-backup.sh

# Retention policy: 30 days
find backups/ -name "backup-*.sql" -mtime +30 -delete
```

### File Storage Backups
```typescript
// packages/storage/src/backup.ts
export const backupStorageFiles = async () => {
  const buckets = ['profiles', 'documents', 'verifications']
  
  for (const bucket of buckets) {
    await backupBucket(bucket)
  }
}
```

## Security Measures

### 1. SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name unibenservices.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

### 2. Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  // More headers...
]
```

### 3. API Security
- Rate limiting
- Request validation
- JWT token rotation

### 4. Database Security
- Row Level Security (RLS)
- Encryption at rest
- Audit logging

## Performance Optimization

### 1. Caching Strategy

```typescript
// Cache configuration
export const revalidate = 3600 // 1 hour

// API route caching
export const dynamic = 'force-dynamic'
```

### 2. CDN Configuration

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
    minimumCacheTTL: 60,
  },
}
```

## Rollback Procedures

### 1. Application Rollback

```bash
# Revert to previous deployment
vercel rollback

# Verify rollback
vercel logs
```

### 2. Database Rollback

```bash
# Revert last migration
pnpm prisma migrate reset

# Apply specific migration
pnpm prisma migrate deploy --to-version {version}
```

## Maintenance Procedures

### 1. Scheduled Maintenance

- Database optimization
- Cache clearing
- Log rotation
- Security updates

### 2. Emergency Procedures

- Incident response plan
- Communication templates
- Emergency contacts
- Recovery procedures

## Documentation

### 1. API Documentation

- OpenAPI specification
- API changelog
- Rate limiting info
- Authentication guide

### 2. User Documentation

- System requirements
- Installation guide
- Configuration guide
- Troubleshooting guide

## Compliance

### 1. Data Protection

- GDPR compliance
- Data retention
- Privacy policy
- Cookie policy

### 2. Security Standards

- PCI DSS (for payments)
- OWASP guidelines
- Security audits
- Penetration testing