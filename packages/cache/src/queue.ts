import { Queue, Worker, Job, QueueOptions, WorkerOptions } from 'bullmq';
import { logger } from '@repo/logs';

interface QueueConfig {
  redisUrl?: string;
  redisHost?: string;
  redisPort?: number;
  redisPassword?: string;
  redisUsername?: string;
  redisDatabase?: number;
}

interface PayoutJobData {
  payoutId: string;
  amount: number;
  currency: string;
  bankDetails: {
    accountNumber: string;
    bankCode: string;
    accountName: string;
  };
  providerId: string;
  retryCount?: number;
}

interface ProcessingJobData {
  type: 'process_approved_payouts';
  batchSize?: number;
}

class QueueManager {
  private static instance: QueueManager;
  private payoutQueue: Queue | null = null;
  private batchQueue: Queue | null = null;
  private workers: Worker[] = [];

  private constructor() {}

  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  private getRedisConnection() {
    const config = this.getQueueConfig();
    
    if (config.redisUrl) {
      return { 
        connection: { url: config.redisUrl },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        }
      };
    }

    return {
      connection: {
        host: config.redisHost || 'localhost',
        port: config.redisPort || 6379,
        password: config.redisPassword,
        username: config.redisUsername || 'default',
        db: config.redisDatabase || 0,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
      }
    };
  }

  private getQueueConfig(): QueueConfig {
    return {
      redisUrl: process.env.REDIS_URL,
      redisHost: process.env.REDIS_HOST,
      redisPort: Number(process.env.REDIS_PORT),
      redisPassword: process.env.REDIS_PASSWORD,
      redisUsername: process.env.REDIS_USERNAME,
      redisDatabase: Number(process.env.REDIS_DB),
    };
  }

  public getPayoutQueue(): Queue\u003cPayoutJobData\u003e {
    if (!this.payoutQueue) {
      const redisConfig = this.getRedisConnection();
      
      this.payoutQueue = new Queue\u003cPayoutJobData\u003e('payout-processing', {
        ...redisConfig,
        defaultJobOptions: {
          ...redisConfig.defaultJobOptions,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      });

      this.payoutQueue.on('error', (error) => {
        logger.error('Payout queue error:', error);
      });

      logger.info('Payout queue initialized');
    }

    return this.payoutQueue;
  }

  public getBatchQueue(): Queue\u003cProcessingJobData\u003e {
    if (!this.batchQueue) {
      const redisConfig = this.getRedisConnection();
      
      this.batchQueue = new Queue\u003cProcessingJobData\u003e('batch-processing', {
        ...redisConfig,
        defaultJobOptions: {
          ...redisConfig.defaultJobOptions,
          attempts: 2,
          backoff: {
            type: 'fixed',
            delay: 30000,
          },
        },
      });

      this.batchQueue.on('error', (error) => {
        logger.error('Batch queue error:', error);
      });

      logger.info('Batch queue initialized');
    }

    return this.batchQueue;
  }

  public async addPayoutJob(data: PayoutJobData, options?: { delay?: number; priority?: number }): Promise\u003cJob\u003cPayoutJobData\u003e | null\u003e {
    try {
      const queue = this.getPayoutQueue();
      const job = await queue.add('process-payout', data, {
        delay: options?.delay,
        priority: options?.priority || 0,
        jobId: `payout-${data.payoutId}`, // Prevent duplicate jobs
      });
      
      logger.info(`Payout job added for payout ${data.payoutId}`, { jobId: job.id });
      return job;
    } catch (error) {
      logger.error('Failed to add payout job:', error);
      return null;
    }
  }

  public async addBatchProcessingJob(delay: number = 0): Promise\u003cJob\u003cProcessingJobData\u003e | null\u003e {
    try {
      const queue = this.getBatchQueue();
      const job = await queue.add('process-approved-payouts', { 
        type: 'process_approved_payouts',
        batchSize: 50 
      }, {
        delay,
        jobId: `batch-${Date.now()}`, // Unique job ID for each batch
      });
      
      logger.info(`Batch processing job added`, { jobId: job.id });
      return job;
    } catch (error) {
      logger.error('Failed to add batch processing job:', error);
      return null;
    }
  }

  public async setupRecurringBatchJob(): Promise\u003cvoid\u003e {
    try {
      const queue = this.getBatchQueue();
      
      // Remove existing repeatable jobs
      const repeatableJobs = await queue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        await queue.removeRepeatableByKey(job.key);
      }

      // Add new recurring job every 2 hours
      await queue.add('process-approved-payouts', { 
        type: 'process_approved_payouts',
        batchSize: 100 
      }, {
        repeat: {
          every: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
        },
        jobId: 'recurring-batch-processor',
      });

      logger.info('Recurring batch job set up successfully');
    } catch (error) {
      logger.error('Failed to setup recurring batch job:', error);
    }
  }

  public initializeWorkers(options: { enableWorkers?: boolean } = {}): void {
    if (!options.enableWorkers) {
      logger.info('Workers disabled by configuration');
      return;
    }

    // Don't initialize workers in serverless environments
    if (process.env.VERCEL || process.env.NETLIFY) {
      logger.info('Skipping worker initialization in serverless environment');
      return;
    }

    this.setupPayoutWorker();
    this.setupBatchWorker();
  }

  private setupPayoutWorker(): void {
    const redisConfig = this.getRedisConnection();
    
    const worker = new Worker\u003cPayoutJobData\u003e('payout-processing', async (job: Job\u003cPayoutJobData\u003e) => {
      logger.info(`Processing payout job ${job.id}`, { payoutId: job.data.payoutId });
      
      try {
        // Import the payout processor dynamically to avoid circular dependencies
        const { processPayoutJob } = await import('./processors/payout-processor');
        await processPayoutJob(job.data);
        
        logger.info(`Payout job ${job.id} completed successfully`);
      } catch (error) {
        logger.error(`Payout job ${job.id} failed:`, error);
        throw error; // Let BullMQ handle retries
      }
    }, {
      ...redisConfig,
      concurrency: Number(process.env.PAYOUT_WORKER_CONCURRENCY) || 5,
      limiter: {
        max: Number(process.env.PAYOUT_WORKER_RATE_LIMIT) || 10,
        duration: 60000, // per minute
      },
    });

    worker.on('error', (error) => {
      logger.error('Payout worker error:', error);
    });

    worker.on('completed', (job) => {
      logger.info(`Payout job completed: ${job.id}`);
    });

    worker.on('failed', (job, error) => {
      logger.error(`Payout job failed: ${job?.id}`, error);
    });

    this.workers.push(worker);
    logger.info('Payout worker initialized');
  }

  private setupBatchWorker(): void {
    const redisConfig = this.getRedisConnection();
    
    const worker = new Worker\u003cProcessingJobData\u003e('batch-processing', async (job: Job\u003cProcessingJobData\u003e) => {
      logger.info(`Processing batch job ${job.id}`);
      
      try {
        // Import the batch processor dynamically
        const { processBatchJob } = await import('./processors/batch-processor');
        await processBatchJob(job.data);
        
        logger.info(`Batch job ${job.id} completed successfully`);
      } catch (error) {
        logger.error(`Batch job ${job.id} failed:`, error);
        throw error;
      }
    }, {
      ...redisConfig,
      concurrency: Number(process.env.BATCH_WORKER_CONCURRENCY) || 1,
      limiter: {
        max: Number(process.env.BATCH_WORKER_RATE_LIMIT) || 1,
        duration: 60000,
      },
    });

    worker.on('error', (error) => {
      logger.error('Batch worker error:', error);
    });

    worker.on('completed', (job) => {
      logger.info(`Batch job completed: ${job.id}`);
    });

    worker.on('failed', (job, error) => {
      logger.error(`Batch job failed: ${job?.id}`, error);
    });

    this.workers.push(worker);
    logger.info('Batch worker initialized');
  }

  public async getQueueStats() {
    const payoutQueue = this.getPayoutQueue();
    const batchQueue = this.getBatchQueue();

    return {
      payout: {
        waiting: await payoutQueue.getWaiting(),
        active: await payoutQueue.getActive(),
        completed: await payoutQueue.getCompleted(),
        failed: await payoutQueue.getFailed(),
      },
      batch: {
        waiting: await batchQueue.getWaiting(),
        active: await batchQueue.getActive(),
        completed: await batchQueue.getCompleted(),
        failed: await batchQueue.getFailed(),
      },
    };
  }

  public async closeAll(): Promise\u003cvoid\u003e {
    logger.info('Closing all queues and workers...');
    
    // Close workers
    await Promise.all(this.workers.map(worker => worker.close()));
    this.workers = [];
    
    // Close queues
    if (this.payoutQueue) {
      await this.payoutQueue.close();
      this.payoutQueue = null;
    }
    
    if (this.batchQueue) {
      await this.batchQueue.close();
      this.batchQueue = null;
    }
    
    logger.info('All queues and workers closed');
  }
}

// Export singleton instance
export const queueManager = QueueManager.getInstance();
export default queueManager;

// Export types
export type { PayoutJobData, ProcessingJobData };
