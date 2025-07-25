'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PaymentSuccess } from '../../../../modules/payments/components/payment-success';
import { Button } from '../../../../modules/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../modules/ui/components/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentVerificationResult {
  success: boolean;
  status: string;
  transactionRef: string;
  amount?: number;
  currency?: string;
  booking?: {
    id: string;
    service: {
      id: string;
      name: string;
      description: string;
      price: number;
      duration: number;
    };
    scheduledFor: string;
  };
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');
  
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!reference) {
        setError('No payment reference found');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/payments/enhanced/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionRef: reference,
            provider: 'paystack',
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error?.message || 'Payment verification failed');
        }

        setVerificationResult(result);
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err instanceof Error ? err.message : 'Payment verification failed');
      } finally {
        setIsLoading(false);
      }
    }

    verifyPayment();
  }, [reference]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Verifying Payment</h2>
                <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !verificationResult) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 mx-auto text-red-500" />
              <div>
                <h2 className="text-xl font-semibold text-red-600">Payment Verification Failed</h2>
                <p className="text-muted-foreground mt-2">
                  {error || 'Unable to verify your payment. Please contact support if you believe this is an error.'}
                </p>
              </div>
              <div className="space-y-2">
                <Button onClick={() => router.push('/bookings')} className="w-full">
                  View My Bookings
                </Button>
                <Button onClick={() => router.push('/support')} variant="outline" className="w-full">
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment was not successful
  if (!verificationResult.success) {
    const getStatusMessage = () => {
      switch (verificationResult.status) {
        case 'abandoned':
          return 'You cancelled the payment process.';
        case 'failed':
          return 'Your payment could not be processed.';
        case 'pending':
          return 'Your payment is still being processed.';
        default:
          return 'Your payment was not completed successfully.';
      }
    };

    const getStatusColor = () => {
      switch (verificationResult.status) {
        case 'abandoned':
          return 'text-orange-600';
        case 'failed':
          return 'text-red-600';
        case 'pending':
          return 'text-blue-600';
        default:
          return 'text-gray-600';
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 mx-auto text-orange-500" />
              <div>
                <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
                  Payment {verificationResult.status === 'abandoned' ? 'Cancelled' : 
                           verificationResult.status === 'pending' ? 'Processing' : 'Failed'}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {getStatusMessage()}
                </p>
                {verificationResult.gatewayResponse && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Gateway response: {verificationResult.gatewayResponse}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Button onClick={() => router.push('/services')} className="w-full">
                  Browse Services
                </Button>
                <Button onClick={() => router.push('/bookings')} variant="outline" className="w-full">
                  View My Bookings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment was successful - show detailed success page
  if (verificationResult.booking) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <PaymentSuccess
          bookingId={verificationResult.booking.id}
          transactionRef={verificationResult.transactionRef}
          service={verificationResult.booking.service}
          bookingDateTime={verificationResult.booking.scheduledFor}
          totalAmount={verificationResult.amount || verificationResult.booking.service.price}
          onViewBooking={() => router.push(`/bookings/${verificationResult.booking!.id}`)}
          onBookAnother={() => router.push('/services')}
        />
      </div>
    );
  }

  // Fallback success page without booking details
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <div>
              <h2 className="text-xl font-semibold text-green-600">Payment Successful!</h2>
              <p className="text-muted-foreground mt-2">
                Your payment has been processed successfully.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Transaction: {verificationResult.transactionRef}
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => router.push('/bookings')} className="w-full">
                View My Bookings
              </Button>
              <Button onClick={() => router.push('/services')} variant="outline" className="w-full">
                Book Another Service
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
