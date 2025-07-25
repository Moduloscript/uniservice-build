export type PaymentProvider = 'paystack' | 'flutterwave';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'abandoned' | 'refunded' | 'disputed';

export type PaymentChannel = 'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer';

export interface PaymentInitiationRequest {
  amount: number;
  currency: string;
  email: string;
  name: string;
  bookingId: string;
  serviceId: string;
  providerId: string;
  channels?: PaymentChannel[];
  metadata?: Record<string, any>;
}

export interface PaymentInitiationResponse {
  success: boolean;
  paymentUrl?: string;
  transactionRef?: string;
  provider: PaymentProvider;
  message?: string;
  existingPayment?: boolean;
  status?: string;
  accessCode?: string;
  fees?: number;
}

export interface PaymentVerificationRequest {
  transactionRef: string;
  provider: PaymentProvider;
}

export interface PaymentVerificationResponse {
  success: boolean;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  transactionRef: string;
  provider: PaymentProvider;
  gatewayResponse?: string;
  paidAt?: string;
  channel?: string;
  fees?: number;
  authorization?: PaystackAuthorization;
  customer?: PaystackCustomer;
  metadata?: Record<string, any>;
  booking?: {
    id: string;
    service: {
      id: string;
      name: string;
      description: string;
      price: number;
      duration: number;
    };
    scheduledFor: string;
  };
}

// Paystack specific types
export interface PaystackInitializationResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    log: any;
    fees: number;
    fees_split: any;
    authorization: PaystackAuthorization;
    customer: PaystackCustomer;
    plan: any;
    split: any;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
    source: any;
    fees_breakdown: any;
  };
}

export interface PaystackAuthorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name?: string;
}

export interface PaystackCustomer {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
  customer_code: string;
  phone?: string;
  metadata?: Record<string, any>;
  risk_action: string;
  international_format_phone?: string;
}

// Webhook event types
export interface WebhookEvent {
  event: string;
  data: Record<string, any>;
}

export interface PaystackWebhookEvent extends WebhookEvent {
  event: 'charge.success' | 'charge.failed' | 'transfer.success' | 'transfer.failed' | 'transfer.reversed';
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    authorization: PaystackAuthorization;
    customer: PaystackCustomer;
    metadata: Record<string, any>;
    fees?: number;
    fees_split?: any;
  };
}

// Flutterwave specific types
export interface FlutterwaveInitializationResponse {
  status: string;
  message: string;
  data: {
    link: string;
  };
}

export interface FlutterwaveVerificationResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
    meta: Record<string, any>;
  };
}

export interface PaymentMethodOption {
  id: PaymentProvider;
  name: string;
  description: string;
  icon: string;
  fees: string;
  supported: boolean;
}
