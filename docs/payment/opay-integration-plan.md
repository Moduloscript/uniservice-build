# Flutterwave OPay Integration Implementation Plan

## 📋 Pre-Implementation Checklist

### 1. **Prerequisites**
- [ ] Flutterwave account with API access
- [ ] API keys from Flutterwave dashboard (Test & Production)
- [ ] Existing Flutterwave integration in the project
- [ ] Understanding that OPay only works with NGN (Nigerian Naira)

### 2. **Technical Requirements**
- [ ] Webhook endpoint configured in Flutterwave dashboard
- [ ] SSL certificate for webhook URL (production)
- [ ] Error handling and logging infrastructure

## 🔧 Implementation Steps

### **Phase 1: Backend Infrastructure (Week 1)**

#### Step 1: Extend Payment Types
```typescript
// 1.1 Add OPay to payment method types
- Add OPAY to PaymentMethodType enum
- Create OPayPaymentMethod interface
- Update payment validation schemas
```

#### Step 2: Create OPay Service Module
```typescript
// 2.1 Create service class structure
- OPayService class with Flutterwave integration
- Methods: createCustomer, createPaymentMethod, createCharge
- Webhook handler for OPay notifications
- Transaction status verification
```

#### Step 3: Database Schema Updates
```sql
-- 3.1 Extend transaction table if needed
- Add opay_reference column if required
- Update payment_method enum to include 'opay'
- Add indexes for OPay-specific queries
```

### **Phase 2: API Implementation (Week 1-2)**

#### Step 4: API Endpoints
```typescript
// 4.1 Create OPay-specific endpoints
POST /api/payments/opay/initialize
GET /api/payments/opay/verify/:reference
POST /api/payments/opay/webhook

// 4.2 Extend existing payment endpoints
- Update general payment initialization to support OPay
- Add OPay option to payment methods list endpoint
```

#### Step 5: Integration Flow Implementation
Following Flutterwave's documented flow:

1. **Customer Creation**
   ```
   - Check if customer exists in DB
   - If not, create via Flutterwave API
   - Store customer_id mapping
   ```

2. **Payment Method Creation**
   ```
   - Create OPay payment method for customer
   - Store payment_method_id
   - Associate with user account
   ```

3. **Charge Creation**
   ```
   - Generate unique reference
   - Create charge with Flutterwave
   - Store transaction in pending state
   - Return redirect URL to frontend
   ```

4. **Payment Authorization**
   ```
   - Handle redirect from OPay
   - Process webhook notifications
   - Update transaction status
   - Trigger business logic (service activation, etc.)
   ```

### **Phase 3: Frontend Implementation (Week 2)**

#### Step 6: UI Components
```typescript
// 6.1 Payment method selection
- Add OPay option to PaymentMethodSelector
- Display OPay logo and description
- Show NGN-only restriction message

// 6.2 Payment flow components
- OPayPaymentInitiator component
- OPayRedirectHandler for return URL
- Payment status display
```

#### Step 7: User Experience Flow
```
1. User selects OPay as payment method
2. Display informational message about OPay login requirement
3. Initialize payment and get redirect URL
4. Redirect user to OPay platform
5. Handle return from OPay
6. Show payment status (success/failure)
```

### **Phase 4: Testing & Security (Week 2-3)**

#### Step 8: Testing Strategy
```
// 8.1 Unit Tests
- Service methods testing
- API endpoint testing
- Webhook signature verification

// 8.2 Integration Tests
- Full payment flow testing
- Error scenarios
- Webhook handling

// 8.3 E2E Tests
- Complete user journey
- Payment success/failure paths
```

#### Step 9: Security Implementation
```
- Webhook signature verification
- HTTPS enforcement for callbacks
- Rate limiting on payment endpoints
- Input validation and sanitization
- Secure storage of sensitive data
```

### **Phase 5: Deployment & Monitoring (Week 3)**

#### Step 10: Deployment Preparation
```
// 10.1 Configuration
- Environment variables for API keys
- Webhook URLs for each environment
- Feature flags for gradual rollout

// 10.2 Documentation
- API documentation update
- User guide for OPay payments
- Troubleshooting guide
```

#### Step 11: Monitoring Setup
```
- Payment success/failure rates
- OPay-specific error tracking
- Response time monitoring
- Webhook delivery monitoring
```

## 📊 Implementation Timeline

| Week | Phase | Key Deliverables |
|------|-------|------------------|
| 1 | Backend Infrastructure | Service module, DB updates, basic API |
| 2 | API & Frontend | Complete API, UI components, payment flow |
| 3 | Testing & Deployment | Full testing suite, security audit, production deployment |

## 🚨 Important Considerations

### 1. **User Communication**
- Clear messaging that OPay requires wallet login
- NGN-only restriction notice
- Expected redirect behavior explanation

### 2. **Error Handling**
- Network timeout handling
- OPay service unavailability
- Invalid customer/payment method scenarios
- Webhook delivery failures

### 3. **Business Logic**
- Define refund policies for OPay
- Handle partial payments if applicable
- Settlement reconciliation process

### 4. **Compliance**
- Ensure compliance with Nigerian payment regulations
- Data protection for customer information
- Transaction record keeping requirements

## 🔄 Post-Implementation

### 1. **Monitoring Phase (Week 4+)**
- Track adoption rates
- Monitor error rates
- Gather user feedback
- Performance optimization

### 2. **Optimization**
- Improve conversion rates
- Reduce payment failures
- Enhance user experience based on feedback

### 3. **Documentation Updates**
- Update based on real-world usage
- Create FAQ section
- Document common issues and solutions

## 📚 API Reference

### Flutterwave OPay Endpoints

#### Create Customer
```bash
POST https://api.flutterwave.cloud/developersandbox/customers
Authorization: Bearer {{YOUR_ACCESS_TOKEN}}
```

#### Create OPay Payment Method
```bash
POST https://api.flutterwave.cloud/developersandbox/payment-methods
{
  "type": "opay"
}
```

#### Create Charge
```bash
POST https://api.flutterwave.cloud/developersandbox/charges
{
  "currency": "NGN",
  "customer_id": "cus_xxxxx",
  "payment_method_id": "pmd_xxxxx",
  "amount": 200,
  "reference": "unique_reference"
}
```

## 🔗 Resources

- [Flutterwave OPay Documentation](https://developer.flutterwave.com/docs/opay)
- [Flutterwave API Reference](https://developer.flutterwave.com/reference)
- [OPay Direct Documentation](https://documentation.opayweb.com/doc/offline/overview.html) (for reference)

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Planning Phase
