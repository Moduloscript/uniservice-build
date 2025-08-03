import { logger } from '@repo/logs';
import { db } from '@repo/database';
import type { PayoutJobData } from '../queue';

interface FlutterwaveTransferResponse {
  status: string;
  message: string;
  data: {
    id: number;
    account_number: string;
    bank_code: string;
    full_name: string;
    created_at: string;
    currency: string;
    amount: number;
    fee: number;
    status: string;
    reference: string;
    meta: any;
    narration: string;
    complete_message: string;
    requires_approval: number;
    is_approved: number;
    bank_name: string;
  };
}

export async function processPayoutJob(jobData: PayoutJobData): Promise<void> {
  const { payoutId, amount, currency, bankDetails, providerId } = jobData;
  
  logger.info(`Starting payout processing for ${payoutId}`, {
    payoutId,
    amount,
    currency,
    providerId
  });

  try {
    // 1. Update payout status to PROCESSING
    await db.payout.update({
      where: { id: payoutId },
      data: { 
        status: 'PROCESSING',
        updatedAt: new Date()
      }
    });

    // 2. Validate payout still exists and is approved
    const payout = await db.payout.findUnique({
      where: { id: payoutId },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!payout) {
      throw new Error(`Payout ${payoutId} not found`);
    }

    if (payout.status !== 'PROCESSING') {
      throw new Error(`Payout ${payoutId} is not in PROCESSING status: ${payout.status}`);
    }

    // 3. Initiate transfer with Flutterwave
    const transferResult = await initiateFlutterwaveTransfer({
      amount,
      currency,
      bankDetails,
      reference: payoutId,
      narration: `Payout to ${payout.provider.name}`,
      beneficiary_name: bankDetails.accountName
    });

    // 4. Update payout with transfer reference
    await db.payout.update({
      where: { id: payoutId },
      data: {
        transactionRef: transferResult.data.reference,
        metadata: transferResult,
        updatedAt: new Date()
      }
    });

    logger.info(`Payout ${payoutId} initiated successfully`, {
      payoutId,
      flutterwaveReference: transferResult.data.reference,
      flutterwaveId: transferResult.data.id
    });

  } catch (error) {
    logger.error(`Payout processing failed for ${payoutId}:`, error);
    
    // Update payout status to FAILED
    await db.payout.update({
      where: { id: payoutId },
      data: {
        status: 'FAILED',
        failureReason: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date()
      }
    });

    // Re-throw to trigger retry mechanism if configured
    throw error;
  }
}

async function initiateFlutterwaveTransfer(transferData: {
  amount: number;
  currency: string;
  bankDetails: {
    accountNumber: string;
    bankCode: string;
    accountName: string;
  };
  reference: string;
  narration: string;
  beneficiary_name: string;
}): Promise<FlutterwaveTransferResponse> {
  
  const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  
  if (!flutterwaveSecretKey) {
    throw new Error('Flutterwave secret key not configured');
  }

  const transferPayload = {
    account_bank: transferData.bankDetails.bankCode,
    account_number: transferData.bankDetails.accountNumber,
    amount: transferData.amount,
    currency: transferData.currency,
    reference: transferData.reference,
    narration: transferData.narration,
    beneficiary_name: transferData.beneficiary_name,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/flutterwave/payout-status`
  };

  logger.info('Initiating Flutterwave transfer', {
    reference: transferData.reference,
    amount: transferData.amount,
    currency: transferData.currency,
    bankCode: transferData.bankDetails.bankCode,
    accountNumber: transferData.bankDetails.accountNumber.slice(-4) // Log only last 4 digits
  });

  const response = await fetch('https://api.flutterwave.com/v3/transfers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${flutterwaveSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transferPayload)
  });

  if (!response.ok) {
    const errorData = await response.text();
    logger.error('Flutterwave transfer failed', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(`Flutterwave transfer failed: ${response.status} ${response.statusText}`);
  }

  const result: FlutterwaveTransferResponse = await response.json();
  
  if (result.status !== 'success') {
    logger.error('Flutterwave transfer unsuccessful', {
      status: result.status,
      message: result.message,
      reference: transferData.reference
    });
    throw new Error(`Flutterwave transfer unsuccessful: ${result.message}`);
  }

  logger.info('Flutterwave transfer successful', {
    reference: transferData.reference,
    flutterwaveId: result.data.id,
    status: result.data.status
  });

  return result;
}
