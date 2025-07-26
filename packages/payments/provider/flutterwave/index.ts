import Flutterwave from 'flutterwave-node-v3';
import crypto from 'crypto';

export interface FlutterwaveConfig {
  publicKey: string;
  secretKey: string;
  encryptionKey: string;
  webhookSecretHash: string;
  environment?: 'sandbox' | 'production';
}

export interface FlutterwavePaymentData {
  amount: number;
  currency: string;
  email: string;
  phone?: string;
  name: string;
  tx_ref: string;
  redirect_url: string;
  payment_options?: string;
  customizations?: {
    title: string;
    description: string;
    logo?: string;
  };
  meta?: Record<string, any>;
}

export interface FlutterwaveTransferData {
  amount: number;
  currency: string;
  account_bank: string;
  account_number: string;
  narration: string;
  reference?: string;
  callback_url?: string;
  debit_currency?: string;
}

export class FlutterwaveProvider {
  private flw: any;
  private config: FlutterwaveConfig;

  constructor(config: FlutterwaveConfig) {
    this.config = config;
    this.flw = new Flutterwave(
      config.publicKey,
      config.secretKey,
      config.environment === 'production'
    );
    
    // Debug: Log the Flutterwave SDK structure
    console.log('Flutterwave SDK initialized. Available methods:');
    console.log('flw keys:', Object.keys(this.flw));
    if (this.flw.Payment) {
      console.log('Payment methods:', Object.keys(this.flw.Payment));
    }
    if (this.flw.Charge) {
      console.log('Charge methods:', Object.keys(this.flw.Charge));
    }
  }

  /**
   * Initialize payment with Flutterwave
   */
  async initializePayment(data: FlutterwavePaymentData) {
    try {
      const payload = {
        tx_ref: data.tx_ref,
        amount: data.amount,
        currency: data.currency,
        redirect_url: data.redirect_url,
        payment_options: data.payment_options || 'card,banktransfer,ussd',
        customer: {
          email: data.email,
          phonenumber: data.phone,
          name: data.name,
        },
        customizations: data.customizations || {
          title: 'UniService Payment',
          description: 'Payment for booking service',
        },
        meta: data.meta || {},
      };

      // Use direct API call to Flutterwave v3 API
      const apiUrl = this.config.environment === 'production' 
        ? 'https://api.flutterwave.com/v3/payments'
        : 'https://api.flutterwave.com/v3/payments';
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (result.status === 'success' && result.data && result.data.link) {
        return {
          success: true,
          data: {
            authorization_url: result.data.link,
            access_code: result.data.link,
            reference: data.tx_ref,
          },
        };
      } else {
        console.error('Flutterwave API response:', result);
        return {
          success: false,
          error: result.message || 'Payment initialization failed',
        };
      }
    } catch (error: any) {
      console.error('Flutterwave payment initialization error:', error);
      return {
        success: false,
        error: error.message || 'Payment initialization failed',
      };
    }
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(transactionId: string) {
    try {
      const response = await this.flw.Transaction.verify({ id: transactionId });

      if (response.status === 'success') {
        const transaction = response.data;
        return {
          success: true,
          data: {
            id: String(transaction.id),
            reference: transaction.tx_ref,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status === 'successful' ? 'success' : 'failed',
            gateway_response: transaction.processor_response,
            paid_at: transaction.created_at,
            channel: transaction.payment_type,
            fees: transaction.app_fee,
            customer: {
              email: transaction.customer?.email,
              phone: transaction.customer?.phone_number,
            },
            authorization: {
              authorization_code: transaction.flw_ref,
              bin: transaction.card ? transaction.card.first_6digits : null,
              last4: transaction.card ? transaction.card.last_4digits : null,
              exp_month: transaction.card ? transaction.card.expiry?.split('/')[0] : null,
              exp_year: transaction.card ? transaction.card.expiry?.split('/')[1] : null,
              channel: transaction.payment_type,
              card_type: transaction.card ? transaction.card.type : null,
              bank: transaction.card ? transaction.card.issuer : null,
              country_code: transaction.card ? transaction.card.country : null,
              brand: transaction.card ? transaction.card.issuer : null,
              reusable: false,
            },
          },
        };
      } else {
        return {
          success: false,
          error: response.message || 'Transaction verification failed',
        };
      }
    } catch (error: any) {
      console.error('Flutterwave verification error:', error);
      return {
        success: false,
        error: error.message || 'Transaction verification failed',
      };
    }
  }

  /**
   * Get transaction by reference
   */
  async getTransaction(reference: string) {
    try {
      // Flutterwave doesn't have a direct get by reference endpoint
      // We need to use the list transactions endpoint with the reference filter
      const response = await this.flw.Transaction.fetch({ reference });

      if (response.status === 'success' && response.data.length > 0) {
        const transaction = response.data[0];
        return {
          success: true,
          data: {
            id: String(transaction.id),
            reference: transaction.tx_ref,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status === 'successful' ? 'success' : 'failed',
            gateway_response: transaction.processor_response,
            paid_at: transaction.created_at,
            channel: transaction.payment_type,
            fees: transaction.app_fee,
          },
        };
      } else {
        return {
          success: false,
          error: 'Transaction not found',
        };
      }
    } catch (error: any) {
      console.error('Flutterwave get transaction error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch transaction',
      };
    }
  }

  /**
   * Initialize transfer (payout)
   */
  async initializeTransfer(data: FlutterwaveTransferData) {
    try {
      const payload = {
        account_bank: data.account_bank,
        account_number: data.account_number,
        amount: data.amount,
        narration: data.narration,
        currency: data.currency,
        reference: data.reference || this.generateReference(),
        callback_url: data.callback_url,
        debit_currency: data.debit_currency || data.currency,
      };

      const response = await this.flw.Transfer.initiate(payload);

      if (response.status === 'success') {
        return {
          success: true,
          data: {
            transfer_code: response.data.reference,
            reference: payload.reference,
            status: response.data.status,
          },
        };
      } else {
        return {
          success: false,
          error: response.message || 'Transfer initialization failed',
        };
      }
    } catch (error: any) {
      console.error('Flutterwave transfer error:', error);
      return {
        success: false,
        error: error.message || 'Transfer initialization failed',
      };
    }
  }

  /**
   * Get Nigerian banks list
   */
  async getBanks(country = 'NG') {
    try {
      const response = await this.flw.Bank.country({ country });

      if (response.status === 'success') {
        return {
          success: true,
          data: response.data.map((bank: any) => ({
            id: bank.code,
            name: bank.name,
            code: bank.code,
            slug: bank.name.toLowerCase().replace(/\s+/g, '-'),
            currency: 'NGN',
            type: 'nuban',
            country: country,
          })),
        };
      } else {
        return {
          success: false,
          error: response.message || 'Failed to fetch banks',
        };
      }
    } catch (error: any) {
      console.error('Flutterwave banks fetch error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch banks',
      };
    }
  }

  /**
   * Resolve account details
   */
  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    try {
      const response = await this.flw.Misc.verify_Account({
        account_number: accountNumber,
        account_bank: bankCode,
      });

      if (response.status === 'success') {
        return {
          success: true,
          data: {
            account_number: response.data.account_number,
            account_name: response.data.account_name,
            bank_id: bankCode,
          },
        };
      } else {
        return {
          success: false,
          error: response.message || 'Account verification failed',
        };
      }
    } catch (error: any) {
      console.error('Flutterwave account verification error:', error);
      return {
        success: false,
        error: error.message || 'Account verification failed',
      };
    }
  }

  /**
   * Calculate transaction fees
   */
  async calculateFees(amount: number, currency = 'NGN') {
    try {
      const response = await this.flw.Transaction.fee({
        amount,
        currency,
      });

      if (response.status === 'success') {
        return {
          success: true,
          data: {
            charge_amount: response.data.charge_amount,
            fee: response.data.fee,
            merchant_fee: response.data.merchant_fee,
            flutterwave_fee: response.data.flutterwave_fee,
          },
        };
      } else {
        return {
          success: false,
          error: response.message || 'Fee calculation failed',
        };
      }
    } catch (error: any) {
      console.error('Flutterwave fee calculation error:', error);
      return {
        success: false,
        error: error.message || 'Fee calculation failed',
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      return signature === this.config.webhookSecretHash;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Generate transaction reference
   */
  generateReference(prefix = 'uniservice'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Create virtual account
   */
  async createVirtualAccount(data: {
    email: string;
    bvn: string;
    firstname: string;
    lastname: string;
    phonenumber: string;
    narration?: string;
    is_permanent?: boolean;
  }) {
    try {
      const payload = {
        email: data.email,
        is_permanent: data.is_permanent || true,
        bvn: data.bvn,
        tx_ref: this.generateReference('va'),
        phonenumber: data.phonenumber,
        firstname: data.firstname,
        lastname: data.lastname,
        narration: data.narration || 'UniService Virtual Account',
      };

      const response = await this.flw.VirtualAccount.create(payload);

      if (response.status === 'success') {
        return {
          success: true,
          data: {
            account_number: response.data.account_number,
            bank_name: response.data.bank_name,
            account_reference: response.data.flw_ref,
            account_status: response.data.response_message,
            currency: 'NGN',
          },
        };
      } else {
        return {
          success: false,
          error: response.message || 'Virtual account creation failed',
        };
      }
    } catch (error: any) {
      console.error('Flutterwave virtual account creation error:', error);
      return {
        success: false,
        error: error.message || 'Virtual account creation failed',
      };
    }
  }

  /**
   * Create payment plan (for subscriptions)
   */
  async createPaymentPlan(data: {
    amount: number;
    name: string;
    interval: 'monthly' | 'weekly' | 'daily' | 'yearly';
    duration?: number;
    currency?: string;
  }) {
    try {
      const payload = {
        amount: data.amount,
        name: data.name,
        interval: data.interval,
        duration: data.duration || 0, // 0 means indefinite
        currency: data.currency || 'NGN',
      };

      const response = await this.flw.PaymentPlan.create(payload);

      if (response.status === 'success') {
        return {
          success: true,
          data: {
            id: response.data.id,
            name: response.data.name,
            amount: response.data.amount,
            interval: response.data.interval,
            duration: response.data.duration,
            status: response.data.status,
            currency: response.data.currency,
            plan_token: response.data.plan_token,
          },
        };
      } else {
        return {
          success: false,
          error: response.message || 'Payment plan creation failed',
        };
      }
    } catch (error: any) {
      console.error('Flutterwave payment plan creation error:', error);
      return {
        success: false,
        error: error.message || 'Payment plan creation failed',
      };
    }
  }
}

// Export default instance factory
export const createFlutterwaveProvider = (config: FlutterwaveConfig) => {
  return new FlutterwaveProvider(config);
};

export default FlutterwaveProvider;
