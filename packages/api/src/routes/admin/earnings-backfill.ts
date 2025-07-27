import { Context } from "hono";
import { createEarningsFromCompletedBooking } from "../../utils/earnings-helper";
import { db } from "@repo/database";
import { logger } from "@repo/logs";

export const earningsBackfillHandler = async (c: Context) => {
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ bookingId: string; error: string }> = [];

  try {
    logger.info("Starting earnings backfill process");

    // Find all completed bookings without earnings
    const completedBookings = await db.booking.findMany({
      where: {
        status: "COMPLETED",
        earning: null
      },
      select: {
        id: true,
        providerId: true,
        studentId: true,
        scheduledFor: true
      }
    });

    logger.info(`Found ${completedBookings.length} completed bookings without earnings`);

    if (completedBookings.length === 0) {
      return c.json({
        message: "No completed bookings found without earnings.",
        summary: {
          totalFound: 0,
          processed: 0,
          errors: 0,
          duration: Date.now() - startTime
        }
      });
    }

    // Process each booking individually with error handling
    for (const booking of completedBookings) {
      try {
        await createEarningsFromCompletedBooking(booking.id);
        successCount++;
        logger.info(`Successfully created earnings for booking ${booking.id}`);
      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({
          bookingId: booking.id,
          error: errorMessage
        });
        logger.error(`Failed to create earnings for booking ${booking.id}`, {
          error: errorMessage,
          providerId: booking.providerId,
          studentId: booking.studentId
        });
      }
    }

    const duration = Date.now() - startTime;
    const summary = {
      totalFound: completedBookings.length,
      processed: successCount,
      errors: errorCount,
      duration
    };

    logger.info("Earnings backfill process completed", summary);

    const response: any = {
      message: `Earnings backfill completed. Processed ${successCount} of ${completedBookings.length} bookings.`,
      summary
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    return c.json(response, errorCount > 0 ? 207 : 200); // 207 Multi-Status for partial success

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Earnings backfill process failed", {
      error: error instanceof Error ? error.message : String(error),
      duration,
      successCount,
      errorCount
    });

    return c.json({
      message: "Earnings backfill process failed.",
      error: error instanceof Error ? error.message : String(error),
      summary: {
        totalFound: 0,
        processed: successCount,
        errors: errorCount,
        duration
      }
    }, 500);
  }
};

