"use client";

import { useState, useEffect } from "react";
import { Button } from "../../ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/components/card";
import { Badge } from "../../ui/components/badge";
import { Progress } from "../../ui/components/progress";
import { Loader2, ExternalLink, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { paymentsApi } from "../api";
import type { PaymentProvider, PaymentStatus } from "../types";
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
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const fees = calculatePaymentFees(provider, amount);
  const totalAmount = calculateTotalAmount(provider, amount);

  const initiatePayment = async () => {
    // Prevent duplicate initializations
    if (isInitializing) {
      console.log('[PaymentProcessor] Skipping duplicate initialization');
      return;
    }
    
    try {
      setIsInitializing(true);
      setCurrentStep('initiating');
      setError(null);

      const response = await paymentsApi.initiatePayment({
        amount: totalAmount,
        currency: "NGN",
        email: userEmail,
        name: userName,
        bookingId,
        serviceId,
        providerId,
        metadata: {
          provider,
          originalAmount: amount,
          fees: fees,
        },
      });

      if (!response.success || !response.transactionRef) {
        throw new Error(response.message || "Failed to initialize payment");
      }

      setTransactionRef(response.transactionRef);
      
      // Check if payment already exists and needs verification
      if (response.existingPayment) {
        setCurrentStep('verifying');
        toast.info(response.message || "Checking existing payment status...");
        
        // Start verification polling for existing payment
        setTimeout(() => {
          startPolling(response.transactionRef);
        }, 1000);
        return;
      }
      
      // Handle new payment initialization
      if (!response.paymentUrl) {
        throw new Error("Payment URL not provided");
      }
      
      setPaymentUrl(response.paymentUrl);
      setCurrentStep('redirecting');

      // Auto-redirect after a short delay
      setTimeout(() => {
        window.open(response.paymentUrl, '_blank', 'noopener,noreferrer');
        setCurrentStep('processing');
        startPolling(response.transactionRef);
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      setCurrentStep('failed');
      toast.error(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setIsPolling(false);
  };

  const startPolling = (txRef: string) => {
    // Clear any existing polling interval
    stopPolling();
    
    setIsPolling(true);
    const newPollInterval = setInterval(async () => {
      try {
        setCurrentStep('verifying');
        const verification = await paymentsApi.verifyPayment({
          transactionRef: txRef,
          provider,
        });

        console.log('[PaymentProcessor] Verification response:', verification);
        
        if (verification.success && verification.status === 'success') {
          setCurrentStep('completed');
          stopPolling();
          toast.success("Payment completed successfully!");
          onSuccess(txRef);
        } else if (verification.status === 'failed' || verification.status === 'cancelled' || verification.status === 'abandoned') {
          stopPolling();
          
          // Handle abandoned payments (user closed payment window) differently
          if (verification.status === 'abandoned') {
            setCurrentStep('failed');
            const errorMsg = 'Payment was not completed';
            setError('You closed the payment window before completing the transaction. You can try again below.');
            toast.info('Payment was not completed. Click "Retry Payment" to try again.', {
              duration: 5000,
            });
            // Don't call onFailure immediately - let user retry
          } else {
            setCurrentStep('failed');
            const errorMsg = `Payment ${verification.status}`;
            setError(errorMsg);
            toast.error(errorMsg);
            onFailure(errorMsg);
          }
        }
        // Continue polling for pending/processing status
      } catch (error) {
        console.error('Payment verification error:', error);
        // Continue polling unless it's a critical error
      }
    }, 5000); // Poll every 5 seconds (reduced frequency)
    
    setPollInterval(newPollInterval);

    // Stop polling after 10 minutes
    setTimeout(() => {
      stopPolling();
      if (currentStep !== 'completed' && currentStep !== 'failed') {
        setCurrentStep('failed');
        setError('Payment verification timeout');
        toast.error('Payment verification timeout. Please contact support.');
        onFailure('Payment verification timeout');
      }
    }, 600000); // 10 minutes
  };

  const handleManualVerify = async () => {
    if (!transactionRef) return;
    
    try {
      setCurrentStep('verifying');
      const verification = await paymentsApi.verifyPayment({
        transactionRef,
        provider,
      });

      if (verification.success && verification.status === 'success') {
        setCurrentStep('completed');
        toast.success("Payment verified successfully!");
        onSuccess(transactionRef);
      } else {
        setError(`Payment status: ${verification.status}`);
        toast.error(`Payment verification failed: ${verification.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Auto-initiate payment on component mount
  useEffect(() => {
    initiatePayment();
  }, []);

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
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
              {currentStep === 'redirecting' && paymentUrl && (
                <Button
                  onClick={() => window.open(paymentUrl, '_blank', 'noopener,noreferrer')}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Payment Page
                </Button>
              )}

              {(currentStep === 'processing' || currentStep === 'verifying') && transactionRef && (
                <Button
                  onClick={handleManualVerify}
                  variant="outline"
                  disabled={isPolling}
                  className="flex-1"
                >
                  {isPolling ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Verify Payment
                </Button>
              )}

              {currentStep === 'failed' && (
                <Button
                  onClick={initiatePayment}
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
