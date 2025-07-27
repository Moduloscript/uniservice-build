import { db } from "@repo/database";
import { logger } from "@repo/logs";
import crypto from "crypto";

/**
 * Platform fee configuration
 * Uses environment variables for flexible configuration
 */
const PLATFORM_FEE_PERCENTAGE = Number(process.env.PLATFORM_FEE_PERCENTAGE || 15) / 100; // Default 15%
const MINIMUM_PLATFORM_FEE = Number(process.env.MINIMUM_PLATFORM_FEE || 100); // Default ₦100

/**
 * Get current platform fee configuration
 */
export function getPlatformFeeConfig() {
  return {
    percentage: PLATFORM_FEE_PERCENTAGE * 100, // Convert back to percentage for display
    minimumFee: MINIMUM_PLATFORM_FEE,
    currency: 'NGN'
  };
}

/**
 * Calculate platform fee for a given amount
 */
export function calculatePlatformFee(grossAmount: number): number {
  const calculatedFee = grossAmount * PLATFORM_FEE_PERCENTAGE;
  return Math.max(calculatedFee, MINIMUM_PLATFORM_FEE);
}

/**
 * Calculate earnings breakdown for a given service price
 */
export function calculateEarnings(servicePrice: number) {
  const grossAmount = Number(servicePrice);
  const platformFee = calculatePlatformFee(grossAmount);
  const providerAmount = grossAmount - platformFee;
  
  return {
    grossAmount,
    platformFee,
    providerAmount,
    currency: 'NGN',
    feePercentage: PLATFORM_FEE_PERCENTAGE * 100
  };
}

/**
 * Create earnings record from a completed booking
 */
export async function createEarningsFromCompletedBooking(bookingId: string): Promise<void> {
  try {
    // Get booking with related data
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        provider: {
          select: { id: true, name: true, email: true }
        },
        student: {
          select: { id: true, name: true }
        }
      }
    });

    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    if (booking.status !== "COMPLETED") {
      throw new Error(`Booking ${bookingId} is not completed. Current status: ${booking.status}`);
    }

    // Check if earnings already exist for this booking
    const existingEarning = await db.earning.findUnique({
      where: { bookingId: bookingId }
    });

    if (existingEarning) {
      logger.warn(`Earnings already exist for booking ${bookingId}`, {
        earningId: existingEarning.id,
        providerId: booking.providerId
      });
      return;
    }

    // Calculate amounts
    const grossAmount = Number(booking.service.price);
    const platformFee = calculatePlatformFee(grossAmount);
    const netAmount = grossAmount - platformFee;

    // Create earnings record
    const earning = await db.earning.create({
      data: {
        id: crypto.randomUUID(),
        providerId: booking.providerId,
        bookingId: booking.id,
        grossAmount: grossAmount,
        platformFee: platformFee,
        amount: netAmount,
        currency: "NGN",
        status: "PENDING_CLEARANCE",
        metadata: {
          serviceName: booking.service.name,
          studentName: booking.student.name,
          completedAt: new Date().toISOString(),
          bookingScheduledFor: booking.scheduledFor?.toISOString() || new Date().toISOString()
        }
      }
    });

    logger.info("Earnings created successfully", {
      earningId: earning.id,
      bookingId: booking.id,
      providerId: booking.providerId,
      providerName: booking.provider.name,
      grossAmount: grossAmount,
      platformFee: platformFee,
      netAmount: netAmount,
      serviceName: booking.service.name
    });

    // TODO: Send notification to provider about earnings
    // await sendEarningsNotification(booking.providerId, earning);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error("Failed to create earnings from completed booking", {
      bookingId,
      error: errorMessage,
      stack: errorStack
    });
    throw error;
  }
}

/**
 * Update earnings status (for future payout processing)
 */
export async function updateEarningsStatus(
  earningId: string, 
  newStatus: "PENDING_CLEARANCE" | "AVAILABLE" | "PAID_OUT" | "FROZEN",
  clearedAt?: Date
): Promise<void> {
  try {
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date()
    };

    if (newStatus === "AVAILABLE" && clearedAt) {
      updateData.clearedAt = clearedAt;
    }

    await db.earning.update({
      where: { id: earningId },
      data: updateData
    });

    logger.info("Earnings status updated", {
      earningId,
      newStatus,
      clearedAt
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Failed to update earnings status", {
      earningId,
      newStatus,
      error: errorMessage
    });
    throw error;
  }
}

/**
 * Process earnings clearance (move from PENDING_CLEARANCE to AVAILABLE)
 * This can be called by a scheduled job or admin action
 */
export async function processEarningsClearance(
  providerId?: string,
  clearanceDelayHours: number = 24
): Promise<{ processed: number; errors: number }> {
  const clearanceDate = new Date();
  clearanceDate.setHours(clearanceDate.getHours() - clearanceDelayHours);

  let processed = 0;
  let errors = 0;

  try {
    // Find earnings that are ready for clearance
    const whereClause: any = {
      status: "PENDING_CLEARANCE",
      createdAt: {
        lte: clearanceDate
      }
    };

    if (providerId) {
      whereClause.providerId = providerId;
    }

    const pendingEarnings = await db.earning.findMany({
      where: whereClause,
      include: {
        provider: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    logger.info(`Processing ${pendingEarnings.length} earnings for clearance`, {
      providerId,
      clearanceDelayHours
    });

    // Process each earning
    for (const earning of pendingEarnings) {
      try {
        await updateEarningsStatus(earning.id, "AVAILABLE", new Date());
        processed++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("Failed to clear individual earning", {
          earningId: earning.id,
          providerId: earning.providerId,
          error: errorMessage
        });
        errors++;
      }
    }

    logger.info("Earnings clearance process completed", {
      processed,
      errors,
      providerId
    });

    return { processed, errors };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Earnings clearance process failed", {
      error: errorMessage,
      providerId
    });
    throw error;
  }
}

/**
 * Get earnings summary for a provider
 */
export async function getProviderEarningsSummary(providerId: string) {
  const [
    totalLifetime,
    availableBalance,
    pendingClearance,
    paidOut
  ] = await Promise.all([
    // Total lifetime earnings
    db.earning.aggregate({
      where: { providerId },
      _sum: { amount: true }
    }),
    // Available for payout
    db.earning.aggregate({
      where: { providerId, status: "AVAILABLE" },
      _sum: { amount: true }
    }),
    // Pending clearance
    db.earning.aggregate({
      where: { providerId, status: "PENDING_CLEARANCE" },
      _sum: { amount: true }
    }),
    // Already paid out
    db.earning.aggregate({
      where: { providerId, status: "PAID_OUT" },
      _sum: { amount: true }
    })
  ]);

  return {
    totalLifetime: Number(totalLifetime._sum.amount || 0),
    availableBalance: Number(availableBalance._sum.amount || 0),
    pendingClearance: Number(pendingClearance._sum.amount || 0),
    paidOut: Number(paidOut._sum.amount || 0),
    currency: "NGN"
  };
}
