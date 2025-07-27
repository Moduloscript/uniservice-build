# Test Security Guidelines

## 🔒 Security Best Practices for Test Files

### 1. **Environment Separation**
```bash
# Move test files to separate directory structure
/tests/
  /e2e/
  /unit/
  /fixtures/
  /mocks/
```

### 2. **Environment Variables for Test Data**
```typescript
// Instead of hardcoded values
const testProvider = {
  email: process.env.TEST_PROVIDER_EMAIL || 'provider@example.com',
  password: process.env.TEST_PROVIDER_PASSWORD || 'secure-test-password',
};
```

### 3. **Production Build Exclusion**
```json
// package.json
{
  "files": [
    "dist/**/*",
    "!**/*.test.*",
    "!**/*.spec.*",
    "!**/tests/**",
    "!**/mocks/**"
  ]
}
```

### 4. **Sanitized Mock Data**
```typescript
// Use realistic but obviously fake data
const mockEarnings = {
  totalLifetime: 123400, // Clearly test data
  availableBalance: 56700,
  currency: 'TEST_CURRENCY',
};
```

### 5. **Test-Only Routes**
```typescript
// Conditional test routes
if (process.env.NODE_ENV === 'test') {
  app.route('/test-api', testRoutes);
}
```

## 📁 **File Structure Recommendations**

### Current Structure (Risky):
```
/apps/web/tests/provider-earnings.spec.ts ❌
/packages/api/src/routes/provider/earnings.test.ts ❌
```

### Recommended Structure (Secure):
```
/tests/
  /e2e/
    /provider/
      earnings.spec.ts ✅
  /fixtures/
    earnings-mock-data.ts ✅
  /config/
    test-env.ts ✅

/packages/api/
  /tests/
    /routes/
      provider-earnings.test.ts ✅
```

## 🛡️ **Implementation Steps**

### Step 1: Create Test Environment Configuration
```typescript
// tests/config/test-env.ts
export const TEST_CONFIG = {
  providers: {
    email: process.env.TEST_PROVIDER_EMAIL || 'test-provider@example.org',
    password: process.env.TEST_PROVIDER_PASS || 'SecureTestPass123!',
  },
  mockData: {
    earnings: {
      totalLifetime: 100000,
      currency: 'TEST_NGN',
    },
  },
  apiEndpoints: {
    base: process.env.TEST_API_BASE || 'http://localhost:3000',
  },
};
```

### Step 2: Environment-Based Test Exclusion
```javascript
// next.config.js
module.exports = {
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Exclude test files from production builds
      config.module.rules.push({
        test: /\.(test|spec)\.(js|ts|tsx)$/,
        loader: 'ignore-loader',
      });
    }
    return config;
  },
};
```

### Step 3: Docker Test Isolation
```dockerfile
# Dockerfile.test
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=development
COPY . .
RUN npm run test
```

## 🚀 **Scalability Improvements**

### 1. **Test Data Factories**
```typescript
// tests/factories/earnings-factory.ts
export class EarningsFactory {
  static create(overrides = {}) {
    return {
      id: `test-${Date.now()}`,
      amount: Math.floor(Math.random() * 100000),
      status: 'COMPLETED',
      createdAt: new Date(),
      ...overrides,
    };
  }
}
```

### 2. **Shared Test Utilities**
```typescript
// tests/utils/test-helpers.ts
export const createMockProvider = () => ({
  id: 'mock-provider-id',
  email: 'mock@example.com',
  userType: 'PROVIDER',
});

export const setupTestDatabase = async () => {
  // Database seeding for tests
};

export const cleanupTestDatabase = async () => {
  // Database cleanup after tests
};
```

### 3. **Test Database Isolation**
```typescript
// Use separate test database
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
  'postgresql://test:test@localhost:5432/test_db';
```

## 📋 **Action Items**

### Immediate (High Priority):
- [ ] Move test files to dedicated `/tests` directory
- [ ] Replace hardcoded credentials with environment variables
- [ ] Add production build exclusions for test files
- [ ] Create test-specific mock data with obvious fake values

### Short Term:
- [ ] Implement test data factories
- [ ] Set up isolated test database
- [ ] Create shared test utilities
- [ ] Add test environment configuration

### Long Term:
- [ ] Implement CI/CD security scanning for test files
- [ ] Create automated test data cleanup
- [ ] Add test coverage for security scenarios
- [ ] Implement test data masking for PII

## 🔐 **Security Checklist**

- [ ] No real credentials in test files
- [ ] No production data in tests
- [ ] Test files excluded from production builds
- [ ] Environment variables for sensitive test data
- [ ] Isolated test databases
- [ ] Regular security audits of test code
- [ ] Test data cleanup procedures
- [ ] Access controls for test environments

