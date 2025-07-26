'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/components/card';
import { Button } from '../../ui/components/button';
import { Badge } from '../../ui/components/badge';
import { Separator } from '../../ui/components/separator';
import { Alert, AlertDescription } from '../../ui/components/alert';
import { 
  RefreshCcw, 
  CreditCard, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  XCircle,
  HelpCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentProvider, PaymentChannel } from '../types';

interface PaymentRetryProps {
  bookingId: string;
  amount: number;
  currency?: string;
  failureReason?: string;
  transactionRef?: string;
  previousAttempts?: number;
  maxRetries?: number;
  onRetrySuccess?: (newTransactionRef: string) => void;
  onRetryFailed?: (error: string) => void;
  onCancel?: () => void;
}

interface RetryAttempt {
  attemptNumber: number;
  timestamp: Date;
  status: 'pending' | 'success' | 'failed' | 'abandoned';
  transactionRef: string;
  failureReason?: string;
}

export function PaymentRetry({
  bookingId,
  amount,
  currency = 'NGN',
  failureReason,
  transactionRef,
  previousAttempts = 0,
  maxRetries = 3,
  onRetrySuccess,
  onRetryFailed,
  onCancel,
}: PaymentRetryProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('paystack');
  const [selectedChannels, setSelectedChannels] = useState<PaymentChannel[]>(['card']);
  const [retryAttempts, setRetryAttempts] = useState<RetryAttempt[]>([]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const calculateFees = (amount: number) => {
    return 100 + (amount * 0.015); // Paystack fees
  };

  const canRetry = previousAttempts < maxRetries;
  const remainingAttempts = maxRetries - previousAttempts;

  const getFailureReasonDisplay = (reason?: string) => {
    const commonReasons: Record<string, { title: string; description: string; suggestion: string }> = {
      'insufficient_funds': {
        title: 'Insufficient Funds',
        description: 'Your card or account doesn\'t have enough funds for this transaction.',
        suggestion: 'Please ensure you have sufficient funds or try a different payment method.'
      },
      'invalid_card': {
        title: 'Invalid Card Details',
        description: 'The card information you entered is incorrect or invalid.',
        suggestion: 'Please check your card number, expiry date, and CVV, then try again.'
      },
      'expired_card': {
        title: 'Expired Card',
        description: 'The card you\'re trying to use has expired.',
        suggestion: 'Please use a different card or contact your bank for a replacement.'
      },
      'declined': {
        title: 'Transaction Declined',
        description: 'Your bank or card issuer declined this transaction.',
        suggestion: 'Please contact your bank or try a different payment method.'
      },
      'network_error': {
        title: 'Network Error',
        description: 'There was a network issue during payment processing.',
        suggestion: 'Please check your internet connection and try again.'
      },
      'abandoned': {
        title: 'Payment Abandoned',
        description: 'The payment process was cancelled or timed out.',
        suggestion: 'You can retry the payment when you\'re ready to complete it.'
      },
      'timeout': {
        title: 'Payment Timeout',
        description: 'The payment took too long to process and was cancelled.',
        suggestion: 'Please try again with a stable internet connection.'
      }
    };

    const defaultReason = {
      title: 'Payment Failed',
      description: reason || 'An unknown error occurred during payment processing.',
      suggestion: 'Please try again or contact support if the problem persists.'
    };

    return commonReasons[reason || ''] || defaultReason;
  };

  const failureInfo = getFailureReasonDisplay(failureReason);

  const handleRetryPayment = async () => {
    if (!canRetry) {
      toast.error('Maximum retry attempts reached. Please contact support.');
      return;
    }

    setIsRetrying(true);

    try {
      // TODO: Implement payment retry logic
      toast.info('Payment retry placeholder - implement backend integration');
      
      // Track retry attempt (placeholder)
      const newAttempt: RetryAttempt = {
        attemptNumber: previousAttempts + 1,
        timestamp: new Date(),
        status: 'failed',
        transactionRef: 'placeholder-ref',
        failureReason: 'Backend not implemented',
      };

      setRetryAttempts(prev => [...prev, newAttempt]);
      onRetryFailed?.('Payment backend not implemented');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Retry failed';
      toast.error(errorMessage);
      onRetryFailed?.(errorMessage);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleContactSupport = () => {
    router.push(`/support?issue=payment_failed&booking=${bookingId}&ref=${transactionRef}`);
  };

  const handleTryDifferentMethod = () => {
    router.push(`/bookings/${bookingId}/payment`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Failure Alert */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">{failureInfo.title}</p>
            <p className="text-sm">{failureInfo.description}</p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Payment Failed
          </CardTitle>
          <CardDescription>
            Don't worry! You can retry your payment or try a different method.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium">{formatAmount(amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Transaction Fee</span>
            <span className="font-medium">{formatAmount(calculateFees(amount))}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount</span>
            <span className="text-primary">{formatAmount(amount + calculateFees(amount))}</span>
          </div>
          
          {transactionRef && (
            <div className="text-xs text-muted-foreground">
              Failed Transaction: {transactionRef}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retry Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5" />
            Retry Payment
          </CardTitle>
          <CardDescription>
            {canRetry 
              ? `You have ${remainingAttempts} retry attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
              : 'You have reached the maximum number of retry attempts.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Suggestion */}
          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Suggestion:</p>
              <p className="text-sm">{failureInfo.suggestion}</p>
            </AlertDescription>
          </Alert>

          {/* Retry Attempts History */}
          {retryAttempts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Previous Attempts:</h4>
              {retryAttempts.map((attempt) => (
                <div key={attempt.transactionRef} className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded">
                  <span>Attempt #{attempt.attemptNumber}</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={attempt.status === 'success' ? 'default' : 
                              attempt.status === 'failed' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {attempt.status}
                    </Badge>
                    <span className="text-muted-foreground">
                      {attempt.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {canRetry && (
              <Button 
                onClick={handleRetryPayment}
                disabled={isRetrying}
                className="w-full"
                size="lg"
              >
                {isRetrying ? (
                  <div className="flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                    Retrying Payment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Retry Payment ({remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} left)
                  </div>
                )}
              </Button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={handleTryDifferentMethod}
                variant="outline"
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Different Method
              </Button>
              
              <Button 
                onClick={handleContactSupport}
                variant="outline"
                className="w-full"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>

            {onCancel && (
              <Button 
                onClick={onCancel}
                variant="ghost"
                className="w-full"
              >
                Cancel and Return
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips for Successful Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tips for Successful Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Ensure you have sufficient funds in your account</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Double-check your card details (number, expiry, CVV)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Use a stable internet connection</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Try a different browser if the issue persists</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Contact your bank if your card is being declined</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
