import { logger } from '@repo/logs';
import { db } from '@repo/database';
import { queueManager } from '../queue';
import type { ProcessingJobData } from '../queue';

export async function processBatchJob(jobData: ProcessingJobData): Promise<void> {
  const { type, batchSize = 50 } = jobData;
  
  logger.info(`Starting batch processing job: ${type}`, { batchSize });

  try {
    if (type === 'process_approved_payouts') {
      await processApprovedPayouts(batchSize);
    } else {
      logger.warn(`Unknown batch job type: ${type}`);
    }
  } catch (error) {
    logger.error(`Batch processing failed for ${type}:`, error);
    throw error;
  }
}

async function processApprovedPayouts(batchSize: number): Promise<void> {
  logger.info(`Processing approved payouts (batch size: ${batchSize})`);

  try {
    // 1. Fetch payouts that are ready for processing (PROCESSING status but not yet queued)
    const approvedPayouts = await db.payout.findMany({
      where: {
        status: 'PROCESSING',
        // Only process payouts that don't have a transaction reference yet (not yet sent to Flutterwave)
        transactionRef: null
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            bankDetails: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Process oldest first
      },
      take: batchSize
    });

    if (approvedPayouts.length === 0) {
      logger.info('No approved payouts found to process');
      return;
    }

    logger.info(`Found ${approvedPayouts.length} approved payouts to process`);

    // 2. Process each payout
    let successCount = 0;
    let failureCount = 0;
    const errors: Array<{ payoutId: string; error: string }> = [];

    for (const payout of approvedPayouts) {
      try {
        // Validate provider has bank details
        if (!payout.provider.bankDetails) {
          throw new Error('Provider bank details not found');
        }

        const bankDetails = payout.provider.bankDetails as {
          accountNumber: string;
          bankCode: string;
          accountName: string;
        };

        // Validate required bank details
        if (!bankDetails.accountNumber || !bankDetails.bankCode || !bankDetails.accountName) {
          throw new Error('Incomplete bank details');
        }

        // Add payout job to queue
        const job = await queueManager.addPayoutJob({
          payoutId: payout.id,
          amount: payout.amount,
          currency: payout.currency || 'NGN',
          bankDetails,
          providerId: payout.provider.id
        });

        if (job) {
          successCount++;
          logger.info(`Queued payout ${payout.id} for processing`, {
            payoutId: payout.id,
            jobId: job.id,
            amount: payout.amount,
            providerId: payout.provider.id
          });
        } else {
          throw new Error('Failed to create job');
        }

      } catch (error) {
        failureCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ payoutId: payout.id, error: errorMessage });
        
        logger.error(`Failed to queue payout ${payout.id}:`, error);

        // Update payout status to FAILED
        await db.payout.update({
          where: { id: payout.id },
          data: {
            status: 'FAILED',
            failureReason: errorMessage,
            updatedAt: new Date()
          }
        });
      }
    }

    // 3. Log batch processing results
    logger.info('Batch processing completed', {
      totalProcessed: approvedPayouts.length,
      successCount,
      failureCount,
      errors: errors.length > 0 ? errors : undefined
    });

    // 4. Create metrics/audit log
    await logBatchProcessingResults({
      totalProcessed: approvedPayouts.length,
      successCount,
      failureCount,
      errors
    });

  } catch (error) {
    logger.error('Batch processing failed:', error);
    throw error;
  }
}

async function logBatchProcessingResults(results: {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  errors: Array<{ payoutId: string; error: string }>;
}): Promise<void> {
  try {
    // You can create a batch processing log table if needed
    // For now, we'll just use structured logging
    logger.info('Batch processing metrics', {
      type: 'batch_processing_metrics',
      timestamp: new Date().toISOString(),
      ...results
    });

    // Optionally, store this in a metrics table for dashboard reporting
    // await db.batchProcessingLog.create({
    //   data: {
    //     type: 'payout_processing',
    //     totalProcessed: results.totalProcessed,
    //     successCount: results.successCount,
    //     failureCount: results.failureCount,
    //     errors: results.errors,
    //     processedAt: new Date()
    //   }
    // });

  } catch (error) {
    logger.error('Failed to log batch processing results:', error);
    // Don't throw here as it's not critical
  }
}
