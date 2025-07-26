"use client";

import { useState, useEffect } from "react";
import { Button } from "../../ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/components/card";
import { Badge } from "../../ui/components/badge";
import { Progress } from "../../ui/components/progress";
import { Loader2, ExternalLink, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { PaymentProvider } from "../types";
import { calculatePaymentFees, calculateTotalAmount, formatNairaAmount } from "../utils/fees";

interface PaymentProcessorProps {
  provider: PaymentProvider;
  amount: number;
  bookingId: string;
  serviceId: string;
  providerId: string;
  userEmail: string;
  userName: string;
  onSuccess: (transactionRef: string) => void;
  onFailure: (error: string) => void;
  onBack: () => void;
}

type ProcessingStep = 'initiating' | 'redirecting' | 'processing' | 'verifying' | 'completed' | 'failed';

const STEP_LABELS: Record<ProcessingStep, string> = {
  initiating: "Initializing payment...",
  redirecting: "Redirecting to payment page...",
  processing: "Processing payment...",
  verifying: "Verifying transaction...",
  completed: "Payment completed successfully!",
  failed: "Payment failed",
};

const STEP_PROGRESS: Record<ProcessingStep, number> = {
  initiating: 20,
  redirecting: 40,
  processing: 60,
  verifying: 80,
  completed: 100,
  failed: 0,
};

export function PaymentProcessor({
  provider,
  amount,
  bookingId,
  serviceId,
  providerId,
  userEmail,
  userName,
  onSuccess,
  onFailure,
  onBack,
}: PaymentProcessorProps) {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('initiating');
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const fees = calculatePaymentFees(provider, amount);
  const totalAmount = calculateTotalAmount(provider, amount);

  // Prepare payment with backend
  const preparePayment = async () => {
    try {
      setCurrentStep('initiating');
      setError(null);
      
      const { paymentsApi } = await import('../api');
      const result = await paymentsApi.initiatePayment({
        amount,
        currency: "NGN",
        email: userEmail,
        name: userName,
        bookingId,
        serviceId,
        providerId,
      });
      
      if (result.success && result.paymentUrl && result.transactionRef) {
        setTransactionRef(result.transactionRef);
        setPaymentUrl(result.paymentUrl);
        setIsReady(true);
        toast.info('Payment prepared. Click "Proceed to Payment" to continue.');
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error: any) {
      console.error('Payment preparation error:', error);
      setCurrentStep('failed');
      setError(error.message || 'Failed to prepare payment');
      onFailure(error.message);
      toast.error(`Payment failed: ${error.message}`);
    }
  };

  // Redirect to payment page (no popup blocking issues)
  const redirectToPayment = async () => {
    if (!paymentUrl || !transactionRef) return;
    
    try {
      setCurrentStep('redirecting');
      
      // Store payment info in sessionStorage for when user returns
      sessionStorage.setItem('pendingPayment', JSON.stringify({
        transactionRef,
        bookingId,
        provider,
        timestamp: Date.now()
      }));
      
      // Show a brief message before redirecting
      toast.info('Redirecting to Flutterwave payment page...');
      
      // Use a small delay to ensure the toast shows
      setTimeout(() => {
        // Redirect to Flutterwave payment page in the same tab
        window.location.href = paymentUrl;
      }, 1000);
      
    } catch (error: any) {
      console.error('Payment redirect error:', error);
      setCurrentStep('failed');
      setError(error.message || 'Failed to redirect to payment page');
      toast.error(`Payment failed: ${error.message}`);
    }
  };

  // Check for returning payment on component mount
  const checkPendingPayment = async () => {
    const pendingPaymentStr = sessionStorage.getItem('pendingPayment');
    if (pendingPaymentStr) {
      try {
        const pendingPayment = JSON.parse(pendingPaymentStr);
        
        // Check if this is the same booking and payment is recent (within 1 hour)
        if (pendingPayment.bookingId === bookingId && 
            (Date.now() - pendingPayment.timestamp) < 3600000) {
          
          setTransactionRef(pendingPayment.transactionRef);
          setCurrentStep('verifying');
          
          // Clear the stored payment info
          sessionStorage.removeItem('pendingPayment');
          
          // Verify the payment status
          const { paymentsApi } = await import('../api');
          const result = await paymentsApi.verifyPayment({
            transactionRef: pendingPayment.transactionRef,
            provider: pendingPayment.provider,
          });
          
          if (result.status === 'completed') {
            setCurrentStep('completed');
            onSuccess(pendingPayment.transactionRef);
            toast.success('Payment completed successfully!');
          } else if (result.status === 'failed') {
            setCurrentStep('failed');
            setError('Payment was not completed');
            onFailure('Payment failed');
          } else {
            // Payment is still pending, continue normal flow
            preparePayment();
          }
        } else {
          // Old or different booking payment, clear it and start fresh
          sessionStorage.removeItem('pendingPayment');
          preparePayment();
        }
      } catch (error) {
        // Invalid stored data, clear it and start fresh
        sessionStorage.removeItem('pendingPayment');
        preparePayment();
      }
    } else {
      // No pending payment, start normal flow
      preparePayment();
    }
  };

  // Manual verification logic
  const handleManualVerify = async () => {
    if (!transactionRef) return;
    
    try {
      setCurrentStep('verifying');
      const { paymentsApi } = await import('../api');
      const result = await paymentsApi.verifyPayment({
        transactionRef,
        provider,
      });
      
      if (result.status === 'completed') {
        setCurrentStep('completed');
        onSuccess(transactionRef);
        toast.success('Payment verified successfully!');
      } else {
        setCurrentStep('failed');
        setError(`Payment status: ${result.status}`);
        onFailure(`Payment ${result.status}`);
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setCurrentStep('failed');
      setError(error.message || 'Failed to verify payment');
      toast.error(`Verification failed: ${error.message}`);
    }
  };

  // Check for pending payment or prepare new payment on component mount
  useEffect(() => {
    checkPendingPayment();
  }, []);

  const getStepIcon = (step: ProcessingStep) => {
    switch (step) {
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'verifying':
      case 'processing':
      case 'redirecting':
      case 'initiating':
        return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getStepColor = (step: ProcessingStep) => {
    switch (step) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={currentStep === 'processing' || currentStep === 'verifying'}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Payment Processing</h3>
          <p className="text-sm text-muted-foreground">
            Processing payment via {provider === 'paystack' ? 'Paystack' : 'Flutterwave'}
          </p>
        </div>
      </div>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Service Amount:</span>
            <span>{formatNairaAmount(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Payment Fees:</span>
            <span>{formatNairaAmount(fees)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-medium">
              <span>Total Amount:</span>
              <span className="font-bold">{formatNairaAmount(totalAmount)}</span>
            </div>
          </div>
          {transactionRef && (
            <div className="text-xs text-muted-foreground pt-2">
              Transaction Ref: {transactionRef}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Status Icon and Message */}
            <div className="flex items-center space-x-4">
              {getStepIcon(currentStep)}
              <div className="flex-1">
                <h4 className={`font-medium ${getStepColor(currentStep)}`}>
                  {STEP_LABELS[currentStep]}
                </h4>
                {error && (
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                )}
              </div>
              <Badge variant={currentStep === 'completed' ? 'default' : currentStep === 'failed' ? 'destructive' : 'secondary'}>
                {currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}
              </Badge>
            </div>

            {/* Progress Bar */}
            <Progress value={STEP_PROGRESS[currentStep]} className="w-full" />

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
              {isReady && currentStep === 'initiating' && (
                <Button
                  onClick={redirectToPayment}
                  variant="default"
                  size="lg"
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </Button>
              )}

              {(currentStep === 'processing' || currentStep === 'verifying') && transactionRef && (
                <Button
                  onClick={handleManualVerify}
                  variant="outline"
                  className="flex-1"
                >
                  Verify Payment
                </Button>
              )}

              {currentStep === 'failed' && (
                <Button
                  onClick={preparePayment}
                  variant="default"
                  className="flex-1"
                >
                  Retry Payment
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {currentStep === 'processing' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Complete Your Payment</h4>
              <p className="text-sm text-blue-700">
                A new tab has opened with the payment page. Complete your payment there and return here.
                We'll automatically verify your payment once completed.
              </p>
              <ul className="text-xs text-blue-600 space-y-1 mt-3">
                <li>• Don't close this tab while payment is processing</li>
                <li>• Payment verification may take a few moments</li>
                <li>• You'll be notified once payment is confirmed</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Abandoned Payment Information */}
      {currentStep === 'failed' && error?.includes('closed the payment window') && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-900">Payment Not Completed</h4>
              <p className="text-sm text-yellow-700">
                It looks like the payment window was closed before the transaction was completed. 
                This is completely normal and no charges were made to your account.
              </p>
              <ul className="text-xs text-yellow-600 space-y-1 mt-3">
                <li>• Your booking is still reserved</li>
                <li>• No money has been deducted</li>
                <li>• Click "Retry Payment" to try again</li>
                <li>• You can also go back and select a different payment method</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
