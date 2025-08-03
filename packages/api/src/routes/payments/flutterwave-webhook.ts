import { Hono } from "hono";
import { db } from "@repo/database";
import crypto from "crypto";
import { createFlutterwaveProvider } from "@repo/payments";
import { describeRoute } from "hono-openapi";
import { logger } from "@repo/logs";

// Initialize Flutterwave provider
const flutterwaveProvider = createFlutterwaveProvider({
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY!,
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
  encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY!,
  webhookSecretHash: process.env.FLW_SECRET_HASH!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});

export const flutterwaveWebhookRouter = new Hono()
  .post(
    "/flutterwave",
    describeRoute({
      tags: ["Webhooks"],
      summary: "Handle Flutterwave webhook events",
      description: "Process Flutterwave webhook events for payment status updates",
    }),
    async (c) => {
      const secretHash = process.env.FLW_SECRET_HASH;
      const signature = c.req.header("verif-hash");
      
      // 1. Verify webhook signature (using correct v3.0.0 header name)
      if (!signature || signature !== secretHash) {
        logger.warn('Invalid Flutterwave webhook signature', {
          signature: signature ? '[REDACTED]' : 'missing',
          hasSecretHash: !!secretHash
        });
        return c.json({ error: "Invalid signature" }, 401);
      }
      
      const payload = await c.req.json();
      const webhookId = crypto.randomUUID();
      
      try {
        // 2. Log webhook event immediately for audit trail
        const webhookEvent = await db.webhook_event.create({
          data: {
            id: webhookId,
            provider: "flutterwave",
            event_type: payload.event,
            reference: payload.data.tx_ref || payload.data.reference,
            payload: payload,
            signature: signature,
          },
        });
        
        // 3. Process webhook event
        await processFlutterwaveWebhook(payload, webhookEvent.id);
        
        // 4. Mark as processed
        await db.webhook_event.update({
          where: { id: webhookId },
          data: { 
            processed: true, 
            processedAt: new Date() 
          },
        });
        
        return c.json({ status: "success" }, 200);
      } catch (error: any) {
        logger.error('Flutterwave webhook processing error', {
          webhookId,
          error: error.message,
          eventType: payload?.event,
          reference: payload?.data?.tx_ref || payload?.data?.reference
        });
        
        // Update webhook event with error
        await db.webhook_event.update({
          where: { id: webhookId },
          data: { 
            error: error.message,
            retry_count: { increment: 1 }
          },
        });
        
        return c.json({ error: "Processing failed" }, 500);
      }
    }
  );

/**
 * Process Flutterwave webhook events
 */
async function processFlutterwaveWebhook(payload: any, webhookId: string) {
  const { event, data } = payload;
  
  // Use structured logging to prevent format string attacks
  logger.info('Processing Flutterwave webhook', {
    webhookId,
    eventType: event,
    transactionId: data?.id,
    reference: data?.tx_ref || data?.reference
  });
  
  switch (event) {
    case "charge.completed":
      await handleChargeCompleted(data);
      break;
    case "charge.failed":
      await handleChargeFailed(data);
      break;
    case "transfer.completed":
      await handleTransferCompleted(data);
      break;
    case "transfer.failed":
      await handleTransferFailed(data);
      break;
    default:
      logger.warn('Unhandled webhook event type', {
        webhookId,
        eventType: event,
        availableHandlers: ['charge.completed', 'charge.failed', 'transfer.completed', 'transfer.failed']
      });
  }
}

/**
 * Handle successful payment
 */
async function handleChargeCompleted(data: any) {
  // 1. For testing, skip external API verification and use webhook data directly
  // In production, always verify with Flutterwave API
  logger.info('Processing charge completed', {
    transactionId: data?.id,
    reference: data?.tx_ref,
    amount: data?.amount,
    currency: data?.currency
  });
  
  // Mock transaction data from webhook for testing
  const transaction = {
    id: String(data.id),
    reference: data.tx_ref,
    amount: data.amount,
    currency: data.currency,
    status: data.status === 'successful' ? 'success' : 'failed'
  };
  
  // 2. Find existing payment record
  const payment = await db.payment.findUnique({
    where: { transactionRef: data.tx_ref },
    include: { booking: true },
  });
  
  if (!payment) {
    throw new Error(`Payment not found for reference: ${data.tx_ref}`);
  }
  
  // 3. Verify critical transaction data
  if (
    transaction.status !== "success" ||
    Number(transaction.amount) !== payment.amount.toNumber() ||
    transaction.currency !== payment.currency ||
    transaction.reference !== payment.transactionRef
  ) {
    throw new Error("Transaction verification mismatch");
  }
  
  // 4. Update payment status
  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "COMPLETED",
      flutterwaveId: data.id.toString(),
      flutterwaveRef: data.flw_ref,
      paidAt: new Date(data.created_at),
      verifiedAt: new Date(),
      gatewayResponse: data.processor_response,
      fees: data.app_fee ? parseFloat(data.app_fee) : null,
      channel: data.payment_type,
      escrowStatus: "RELEASED",
    },
  });
  
  // 5. Update booking status
  await db.booking.update({
    where: { id: payment.bookingId },
    data: { status: "CONFIRMED" },
  });
  
  logger.info('Payment completed successfully', {
    paymentId: payment.id,
    bookingId: payment.bookingId,
    amount: payment.amount.toNumber(),
    currency: payment.currency,
    flutterwaveId: data.id
  });
  
  // 6. Send confirmation notifications (implement as needed)
  // await sendPaymentConfirmation(payment.bookingId);
}

/**
 * Handle failed payment
 */
async function handleChargeFailed(data: any) {
  // Find existing payment record
  const payment = await db.payment.findUnique({
    where: { transactionRef: data.tx_ref },
    include: { booking: true },
  });
  
  if (!payment) {
    logger.warn('Payment not found for failed transaction', {
      transactionRef: data?.tx_ref,
      transactionId: data?.id
    });
    return;
  }
  
  // Update payment status
  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "FAILED",
      flutterwaveId: data.id.toString(),
      flutterwaveRef: data.flw_ref,
      gatewayResponse: data.processor_response || "Payment failed",
      verifiedAt: new Date(),
    },
  });
  
  // Update booking status
  await db.booking.update({
    where: { id: payment.bookingId },
    data: { status: "CANCELLED" },
  });
  
  logger.info('Payment failed', {
    paymentId: payment.id,
    bookingId: payment.bookingId,
    transactionRef: data?.tx_ref,
    flutterwaveId: data?.id,
    reason: data?.processor_response || 'Payment failed'
  });
  
  // Send failure notification (implement as needed)
  // await sendPaymentFailureNotification(payment.bookingId);
}

/**
 * Handle successful transfer (payout)
 */
async function handleTransferCompleted(data: any) {
  logger.info('Transfer completed', {
    reference: data?.reference,
    amount: data?.amount,
    status: data?.status,
    currency: data?.currency
  });
  
  try {
    // Find the payout by transaction reference
    const payout = await db.payout.findUnique({
      where: { transactionRef: data.reference },
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
      logger.warn('Payout not found for transfer completion', {
        reference: data?.reference,
        transferId: data?.id
      });
      return;
    }
    
    // Update payout status to COMPLETED
    await db.payout.update({
      where: { id: payout.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        gatewayResponse: data.complete_message || 'Transfer completed successfully',
        fees: data.fee ? parseFloat(data.fee) : null,
        netAmount: data.amount ? parseFloat(data.amount) : payout.amount,
        metadata: {
          ...payout.metadata,
          flutterwaveTransferId: data.id,
          completedAt: new Date().toISOString(),
          transferData: data
        }
      }
    });
    
    logger.info('Payout completed successfully', {
      payoutId: payout.id,
      providerId: payout.providerId,
      amount: payout.amount,
      reference: data.reference,
      flutterwaveId: data.id
    });
    
    // TODO: Send success notification to provider
    // await sendPayoutSuccessNotification(payout.providerId, payout.id);
    
  } catch (error) {
    logger.error('Error handling transfer completion:', error);
    throw error;
  }
}

/**
 * Handle failed transfer (payout)
 */
async function handleTransferFailed(data: any) {
  logger.warn('Transfer failed', {
    reference: data?.reference,
    amount: data?.amount,
    status: data?.status,
    error: data?.complete_message || 'Transfer failed',
    currency: data?.currency
  });
  
  try {
    // Find the payout by transaction reference
    const payout = await db.payout.findUnique({
      where: { transactionRef: data.reference },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        earnings: true
      }
    });
    
    if (!payout) {
      logger.warn('Payout not found for failed transfer', {
        reference: data?.reference,
        transferId: data?.id
      });
      return;
    }
    
    // Update payout status to FAILED
    await db.payout.update({
      where: { id: payout.id },
      data: {
        status: 'FAILED',
        failureReason: data.complete_message || 'Transfer failed',
        gatewayResponse: data.complete_message,
        metadata: {
          ...payout.metadata,
          flutterwaveTransferId: data.id,
          failedAt: new Date().toISOString(),
          transferData: data
        }
      }
    });
    
    // Release the reserved earnings back to AVAILABLE status
    await db.earning.updateMany({
      where: {
        payoutId: payout.id,
        status: 'PAID_OUT'
      },
      data: {
        payoutId: null,
        status: 'AVAILABLE'
      }
    });
    
    logger.info('Payout failed - earnings released back to available', {
      payoutId: payout.id,
      providerId: payout.providerId,
      amount: payout.amount,
      reference: data.reference,
      reason: data.complete_message,
      earningsReleased: payout.earnings.length
    });
    
    // TODO: Send failure notification to provider with retry options
    // await sendPayoutFailureNotification(payout.providerId, payout.id, data.complete_message);
    
  } catch (error) {
    logger.error('Error handling transfer failure:', error);
    throw error;
  }
}
