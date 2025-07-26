import { Hono } from "hono";
import { db } from "@repo/database";
import { createFlutterwaveProvider } from "@repo/payments";
import { describeRoute } from "hono-openapi";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth";

// Initialize Flutterwave provider
const flutterwaveProvider = createFlutterwaveProvider({
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY!,
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
  encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY!,
  webhookSecretHash: process.env.FLW_SECRET_HASH!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});

// Validation schemas
const initializePaymentSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  redirectUrl: z.string().url("Valid redirect URL is required").optional(),
});

export const paymentInitializeRouter = new Hono()
  .post(
    "/initialize",
    authMiddleware, // Ensure user is authenticated
    describeRoute({
      tags: ["Payments"],
      summary: "Initialize payment for booking",
      description: "Create a payment link for a booking using Flutterwave",
    }),
    async (c) => {
      try {
        const user = c.get('user');
        if (!user) {
          return c.json({ error: "Authentication required" }, 401);
        }

        const body = await c.req.json();
        const { bookingId, redirectUrl } = initializePaymentSchema.parse(body);

        // 1. Fetch booking with service details
        const booking = await db.booking.findUnique({
          where: { id: bookingId },
          include: {
            service: true,
            student: true,
            provider: true,
          },
        });

        if (!booking) {
          return c.json({ error: "Booking not found" }, 404);
        }

        // 2. Verify user is the student for this booking
        if (booking.studentId !== user.id) {
          return c.json({ error: "Unauthorized: Not your booking" }, 403);
        }

        // 3. Check if booking is in valid state for payment
        if (booking.status !== 'PENDING') {
          return c.json({ 
            error: `Cannot pay for booking with status: ${booking.status}` 
          }, 400);
        }

        // 4. Check if payment already exists for this booking
        const existingPayment = await db.payment.findFirst({
          where: { 
            bookingId: bookingId
          },
          orderBy: { createdAt: 'desc' }
        });

        // 5. Handle existing payment based on its status
        if (existingPayment) {
          // Allow retry for failed or cancelled payments
          if (existingPayment.status === 'FAILED' || existingPayment.status === 'CANCELLED') {
            console.log(`Found existing ${existingPayment.status} payment, creating new payment attempt`);
            // Continue to create a new payment (don't return here)
          } 
          // For PENDING payments with valid URL, return existing
          else if (existingPayment.status === 'PENDING' && existingPayment.metadata?.flutterwave_data?.authorization_url) {
            return c.json({ 
              success: true,
              data: {
                paymentId: existingPayment.id,
                transactionRef: existingPayment.transactionRef,
                amount: existingPayment.amount.toNumber(),
                currency: existingPayment.currency,
                paymentUrl: existingPayment.metadata.flutterwave_data.authorization_url || '',
                service: {
                  id: booking.service.id,
                  name: booking.service.name,
                  price: booking.service.price.toNumber(),
                },
                booking: {
                  id: booking.id,
                  status: booking.status,
                },
                redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payments/verify`,
              },
            });
          } 
          // For PROCESSING or COMPLETED, prevent duplicate payment
          else if (existingPayment.status === 'PROCESSING' || existingPayment.status === 'COMPLETED') {
            return c.json({ 
              error: `Payment already ${existingPayment.status.toLowerCase()} for this booking`,
              paymentId: existingPayment.id,
              status: existingPayment.status
            }, 400);
          }
          // For PENDING without URL or unknown status, cancel it first
          else {
            console.log(`Cancelling existing payment with status: ${existingPayment.status}`);
            await db.payment.update({
              where: { id: existingPayment.id },
              data: { 
                status: 'CANCELLED',
                metadata: {
                  ...existingPayment.metadata,
                  cancelled_reason: 'New payment attempt initiated',
                  cancelled_at: new Date().toISOString()
                }
              }
            });
          }
        }

        // 5. Generate unique transaction reference
        const transactionRef = `uniservice-${Date.now()}-${booking.id.substring(0, 8)}`;

        // 6. Initialize payment with Flutterwave
        const paymentData = {
          amount: booking.service.price.toNumber(),
          currency: 'NGN',
          email: booking.student.email,
          phone: booking.student.phone || undefined,
          name: booking.student.name,
          tx_ref: transactionRef,
          redirect_url: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payments/verify`,
          payment_options: 'card,banktransfer,ussd',
          customizations: {
            title: 'UniService Payment',
            description: `Payment for ${booking.service.name}`,
            logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
          },
          meta: {
            booking_id: bookingId,
            service_id: booking.serviceId,
            provider_id: booking.providerId,
            student_id: booking.studentId,
          },
        };

        const flutterwaveResponse = await flutterwaveProvider.initializePayment(paymentData);

        if (!flutterwaveResponse.success) {
          console.error('Flutterwave initialization failed:', flutterwaveResponse.error);
          return c.json({ 
            error: "Payment initialization failed",
            details: flutterwaveResponse.error
          }, 500);
        }

        // 7. Create payment record in database
        const payment = await db.payment.create({
          data: {
            id: `payment-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            amount: booking.service.price,
            currency: 'NGN',
            status: 'PENDING',
            provider: 'FLUTTERWAVE',
            transactionRef: transactionRef,
            bookingId: bookingId,
            providerId: booking.providerId,
            metadata: {
              flutterwave_data: {
                ...paymentData,
                authorization_url: flutterwaveResponse.data.authorization_url,
              },
              redirect_url: redirectUrl,
            },
          },
        });

        // 8. Return payment details
        return c.json({
          success: true,
          data: {
            paymentId: payment.id,
            transactionRef: transactionRef,
            amount: booking.service.price.toNumber(),
            currency: 'NGN',
            paymentUrl: flutterwaveResponse.data.authorization_url,
            service: {
              id: booking.service.id,
              name: booking.service.name,
              price: booking.service.price.toNumber(),
            },
            booking: {
              id: booking.id,
              status: booking.status,
            },
            redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payments/verify`,
          },
        });

      } catch (error: any) {
        console.error('Payment initialization error:', error);
        
        if (error instanceof z.ZodError) {
          return c.json({
            error: "Validation failed",
            details: error.errors.reduce((acc, err) => {
              const path = err.path.join('.');
              if (!acc[path]) acc[path] = [];
              acc[path].push(err.message);
              return acc;
            }, {} as Record<string, string[]>)
          }, 400);
        }

        return c.json({ 
          error: "Internal server error",
          message: error.message 
        }, 500);
      }
    }
  )
  .get(
    "/verify/:transactionRef",
    authMiddleware,
    describeRoute({
      tags: ["Payments"],
      summary: "Verify payment status",
      description: "Check the status of a payment transaction",
    }),
    async (c) => {
      try {
        const user = c.get('user');
        const { transactionRef } = c.req.param();

        // Find payment record
        const payment = await db.payment.findUnique({
          where: { transactionRef },
          include: {
            booking: {
              include: {
                service: true,
                student: true,
              },
            },
          },
        });

        if (!payment) {
          return c.json({ error: "Payment not found" }, 404);
        }

        // Verify user authorization
        if (payment.booking.studentId !== user.id) {
          return c.json({ error: "Unauthorized" }, 403);
        }

        // Return payment status
        return c.json({
          success: true,
          data: {
            paymentId: payment.id,
            transactionRef: payment.transactionRef,
            amount: payment.amount.toNumber(),
            currency: payment.currency,
            status: payment.status,
            paidAt: payment.paidAt,
            verifiedAt: payment.verifiedAt,
            booking: {
              id: payment.booking.id,
              status: payment.booking.status,
              service: {
                name: payment.booking.service.name,
                price: payment.booking.service.price.toNumber(),
              },
            },
          },
        });

      } catch (error: any) {
        console.error('Payment verification error:', error);
        return c.json({ 
          error: "Internal server error",
          message: error.message 
        }, 500);
      }
    }
  );
