import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '@repo/database';
import { redis, queueManager } from '@repo/cache';
import { logger } from '@repo/logs';
import { requireAuth } from '../middleware/auth';

const app = new Hono();

// Validation schemas
const createPayoutSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(1000000, 'Amount too large'),
  currency: z.string().default('NGN'),
  accountNumber: z.string().min(10, 'Invalid account number'),
  accountName: z.string().min(3, 'Account name required'),
  bankCode: z.string().min(3, 'Bank code required'),
  bankName: z.string().min(3, 'Bank name required'),
  paymentProvider: z.enum(['PAYSTACK', 'FLUTTERWAVE']).default('FLUTTERWAVE')
});

const payoutQuerySchema = z.object({
  status: z.enum(['REQUESTED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
});

// Apply auth middleware to all routes
app.use('*', requireAuth);

// 1. CREATE PAYOUT REQUEST
app.post('/', zValidator('json', createPayoutSchema), async (c) => {
  try {
    const user = c.get('user');
    const payoutData = c.req.valid('json');

    // Verify user is a provider
    if (user.userType !== 'PROVIDER') {
      return c.json({ error: 'Only providers can request payouts' }, 403);
    }

    // Calculate available balance
    const availableEarnings = await db.earning.aggregate({
      where: {
        providerId: user.id,
        status: 'AVAILABLE',
        payoutId: null // Not already included in a payout
      },
      _sum: {
        amount: true
      }
    });

    const availableBalance = availableEarnings._sum.amount || 0;

    // Validate sufficient balance
    if (availableBalance < payoutData.amount) {
      return c.json({
        error: 'Insufficient available balance',
        availableBalance: availableBalance.toString(),
        requestedAmount: payoutData.amount.toString()
      }, 400);
    }

    // Create payout record with REQUESTED status
    const payout = await db.payout.create({
      data: {
        providerId: user.id,
        amount: payoutData.amount,
        currency: payoutData.currency,
        paymentProvider: payoutData.paymentProvider,
        accountNumber: payoutData.accountNumber,
        accountName: payoutData.accountName,
        bankCode: payoutData.bankCode,
        bankName: payoutData.bankName,
        status: 'REQUESTED'
      }
    });

    // Run risk assessment
    const riskAssessment = await assessPayoutRisk(user.id, payoutData.amount);
    
    if (riskAssessment.autoApprove) {
      // Auto-approve and add to queue
      const approvedPayout = await db.payout.update({
        where: { id: payout.id },
        data: { status: 'PROCESSING' }
      });

      // Reserve earnings for this payout
      await reserveEarningsForPayout(user.id, payout.id, payoutData.amount);

      // Add to Redis queue for processing
      await queueManager.addPayoutJob({
        payoutId: payout.id,
        amount: payoutData.amount,
        currency: payoutData.currency,
        bankDetails: {
          accountNumber: payoutData.accountNumber,
          bankCode: payoutData.bankCode,
          accountName: payoutData.accountName
        },
        providerId: user.id
      });

      logger.info('Payout auto-approved and queued', {
        payoutId: payout.id,
        providerId: user.id,
        amount: payoutData.amount
      });

      return c.json({
        data: approvedPayout,
        message: 'Payout approved and processing'
      }, 201);
    } else {
      // Flag for manual review
      logger.info('Payout flagged for manual review', {
        payoutId: payout.id,
        providerId: user.id,
        amount: payoutData.amount,
        riskFactors: riskAssessment.riskFactors
      });

      return c.json({
        data: payout,
        message: 'Payout request received and under review'
      }, 201);
    }

  } catch (error) {
    logger.error('Payout creation failed:', error);
    return c.json({ error: 'Failed to create payout request' }, 500);
  }
});

// 2. GET PROVIDER PAYOUTS
app.get('/', zValidator('query', payoutQuerySchema), async (c) => {
  try {
    const user = c.get('user');
    const query = c.req.valid('query');

    const payouts = await db.payout.findMany({
      where: {
        providerId: user.id,
        ...(query.status && { status: query.status })
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      skip: query.offset,
      include: {
        earnings: {
          select: {
            id: true,
            amount: true,
            bookingId: true
          }
        }
      }
    });

    const total = await db.payout.count({
      where: {
        providerId: user.id,
        ...(query.status && { status: query.status })
      }
    });

    return c.json({
      data: payouts,
      meta: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: total > query.offset + query.limit
      }
    });

  } catch (error) {
    logger.error('Failed to fetch payouts:', error);
    return c.json({ error: 'Failed to fetch payouts' }, 500);
  }
});

// 3. GET SINGLE PAYOUT
app.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const payoutId = c.req.param('id');

    const payout = await db.payout.findFirst({
      where: {
        id: payoutId,
        providerId: user.id
      },
      include: {
        earnings: {
          include: {
            booking: {
              select: {
                id: true,
                service: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!payout) {
      return c.json({ error: 'Payout not found' }, 404);
    }

    return c.json({ data: payout });

  } catch (error) {
    logger.error('Failed to fetch payout:', error);
    return c.json({ error: 'Failed to fetch payout' }, 500);
  }
});

// 4. GET AVAILABLE BALANCE
app.get('/balance/available', async (c) => {
  try {
    const user = c.get('user');

    const result = await db.earning.aggregate({
      where: {
        providerId: user.id,
        status: 'AVAILABLE',
        payoutId: null
      },
      _sum: {
        amount: true
      }
    });

    const availableBalance = result._sum.amount || 0;

    // Get pending payouts
    const pendingPayouts = await db.payout.aggregate({
      where: {
        providerId: user.id,
        status: { in: ['REQUESTED', 'PROCESSING'] }
      },
      _sum: {
        amount: true
      }
    });

    const pendingAmount = pendingPayouts._sum.amount || 0;

    return c.json({
      data: {
        availableBalance: availableBalance.toString(),
        pendingPayouts: pendingAmount.toString(),
        currency: 'NGN'
      }
    });

  } catch (error) {
    logger.error('Failed to fetch balance:', error);
    return c.json({ error: 'Failed to fetch balance' }, 500);
  }
});

// HELPER FUNCTIONS

async function assessPayoutRisk(providerId: string, amount: number) {
  const riskFactors = [];
  
  // Check amount threshold
  if (amount > 50000) {
    riskFactors.push('AMOUNT_THRESHOLD_EXCEEDED');
  }

  // Check provider history
  const provider = await db.user.findUnique({
    where: { id: providerId },
    include: {
      payouts: {
        where: { status: 'COMPLETED' },
        take: 3
      }
    }
  });

  if (!provider?.isVerified) {
    riskFactors.push('PROVIDER_NOT_VERIFIED');
  }

  if ((provider?.payouts?.length || 0) < 3) {
    riskFactors.push('INSUFFICIENT_PAYOUT_HISTORY');
  }

  // Check for recent failed payouts
  const recentFailures = await db.payout.count({
    where: {
      providerId,
      status: 'FAILED',
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }
  });

  if (recentFailures > 0) {
    riskFactors.push('RECENT_FAILED_PAYOUTS');
  }

  const autoApprove = riskFactors.length === 0 || 
    (riskFactors.length === 1 && !riskFactors.includes('AMOUNT_THRESHOLD_EXCEEDED'));

  return {
    autoApprove,
    riskFactors
  };
}

async function reserveEarningsForPayout(providerId: string, payoutId: string, amount: number) {
  // Get available earnings to reserve
  const earnings = await db.earning.findMany({
    where: {
      providerId,
      status: 'AVAILABLE',
      payoutId: null
    },
    orderBy: { clearedAt: 'asc' },
    take: 100 // Reasonable limit
  });

  let remainingAmount = amount;
  const earningsToReserve = [];

  for (const earning of earnings) {
    if (remainingAmount <= 0) break;
    
    const earningAmount = Number(earning.amount);
    if (earningAmount <= remainingAmount) {
      earningsToReserve.push(earning.id);
      remainingAmount -= earningAmount;
    }
  }

  if (remainingAmount > 0) {
    throw new Error('Insufficient earnings to reserve');
  }

  // Update earnings to reference this payout
  await db.earning.updateMany({
    where: {
      id: { in: earningsToReserve }
    },
    data: {
      payoutId,
      status: 'PAID_OUT'
    }
  });
}

export default app;
