import { Hono } from 'hono';
import { getPlatformFeeConfig, calculateEarnings } from '../utils/earnings-helper';
import { authMiddleware } from '../middleware/auth';
import { logger } from '@repo/logs';

export const platformConfigRouter = new Hono()
  .basePath('/platform')
  // Get platform fee configuration (public)
  .get('/fee-config', async (c) => {
    try {
      const config = getPlatformFeeConfig();
      
      logger.info('Platform fee configuration requested', {
        percentage: config.percentage,
        minimumFee: config.minimumFee
      });

      return c.json({
        data: config
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get platform fee configuration', { error: errorMessage });
      
      return c.json({
        error: {
          code: 'CONFIG_ERROR',
          message: 'Failed to get platform configuration'
        }
      }, 500);
    }
  })
  // Calculate earnings preview for a given amount (requires auth)
  .get('/calculate-earnings', authMiddleware, async (c) => {
    const amountParam = c.req.query('amount');
    
    if (!amountParam) {
      return c.json({
        error: {
          code: 'MISSING_PARAMETER',
          message: 'Amount parameter is required'
        }
      }, 400);
    }

    const amount = Number(amountParam);
    if (isNaN(amount) || amount <= 0) {
      return c.json({
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Amount must be a positive number'
        }
      }, 400);
    }

    try {
      const breakdown = calculateEarnings(amount);
      
      logger.info('Earnings calculation requested', {
        userId: c.get('user').id,
        amount,
        platformFee: breakdown.platformFee,
        providerAmount: breakdown.providerAmount
      });

      return c.json({
        data: breakdown
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to calculate earnings', { 
        error: errorMessage,
        amount 
      });
      
      return c.json({
        error: {
          code: 'CALCULATION_ERROR',
          message: 'Failed to calculate earnings'
        }
      }, 500);
    }
  });
