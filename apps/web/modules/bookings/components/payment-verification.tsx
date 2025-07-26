"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/components/card";
import { Button } from "../../ui/components/button";
import { Loader2, CheckCircle, XCircle, AlertCircle, ArrowRight, Home, Receipt } from "lucide-react";
import { toast } from "sonner";
import { verifyPayment } from "../api";

interface PaymentVerificationProps {
  /**
   * Override transaction reference (useful for testing or direct calls)
   */
  transactionRef?: string;
  /**
   * Callback when verification is complete
   */
  onVerificationComplete?: (success: boolean, transactionRef: string) => void;
  /**
   * Custom redirect paths
   */
  successRedirect?: string;
  failureRedirect?: string;
}

export function PaymentVerification({
  transactionRef: propTransactionRef,
  onVerificationComplete,
  successRedirect = "/app/student/bookings",
  failureRedirect = "/app/student/bookings",
}: PaymentVerificationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  // Get transaction reference from props or URL parameters
  const transactionRef = propTransactionRef || 
                        searchParams.get("tx_ref") || 
                        searchParams.get("transaction_id") ||
                        searchParams.get("trxref");

  const status = searchParams.get("status");
  const cancelled = searchParams.get("cancelled");

  // Payment verification query
  const {
    data: paymentData,
    error,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["paymentVerification", transactionRef],
    queryFn: async () => {
      if (!transactionRef) {
        throw new Error("No transaction reference provided");
      }
      return await verifyPayment(transactionRef);
    },
    enabled: !!transactionRef && !verificationAttempted,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    staleTime: 0, // Always fetch fresh data
  });

  // Handle verification results
  useEffect(() => {
    if (paymentData && !verificationAttempted) {
      setVerificationAttempted(true);
      const isSuccess = paymentData.data.status === "COMPLETED";
      
      if (isSuccess) {
        toast.success("Payment verified successfully!");
      } else {
        toast.error(`Payment verification failed: ${paymentData.data.status}`);
      }

      onVerificationComplete?.(isSuccess, transactionRef!);
    }
  }, [paymentData, verificationAttempted, transactionRef, onVerificationComplete]);

  // Handle early cancellation detection
  useEffect(() => {
    if (cancelled === "true" || status === "cancelled") {
      toast.error("Payment was cancelled");
      setVerificationAttempted(true);
      onVerificationComplete?.(false, transactionRef || "");
    }
  }, [cancelled, status, transactionRef, onVerificationComplete]);

  const handleRetryVerification = async () => {
    setVerificationAttempted(false);
    await refetch();
  };

  const handleGoToBookings = () => {
    if (paymentData?.data.status === "COMPLETED") {
      router.push(successRedirect);
    } else {
      router.push(failureRedirect);
    }
  };

  const handleBackHome = () => {
    router.push("/app/student");
  };

  // Show loading state
  if (isLoading && !verificationAttempted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span>Verifying Payment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Please wait while we verify your payment...
            </p>
            {transactionRef && (
              <p className="text-xs text-gray-400 font-mono">
                Ref: {transactionRef}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if ((isError || !transactionRef) && !cancelled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-red-600">
              <XCircle className="h-6 w-6" />
              <span>Verification Failed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {!transactionRef 
                ? "No transaction reference found in the URL" 
                : error instanceof Error 
                  ? error.message 
                  : "Unable to verify your payment at this time"
              }
            </p>
            {transactionRef && (
              <p className="text-xs text-gray-400 font-mono">
                Ref: {transactionRef}
              </p>
            )}
            <div className="flex flex-col space-y-2">
              {transactionRef && (
                <Button 
                  onClick={handleRetryVerification} 
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    "Retry Verification"
                  )}
                </Button>
              )}
              <Button onClick={handleBackHome} variant="secondary">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show cancelled state
  if (cancelled === "true" || status === "cancelled") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-yellow-600">
              <AlertCircle className="h-6 w-6" />
              <span>Payment Cancelled</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your payment was cancelled. You can try again from your bookings page.
            </p>
            <div className="flex flex-col space-y-2">
              <Button onClick={handleGoToBookings}>
                Go to My Bookings
              </Button>
              <Button onClick={handleBackHome} variant="outline">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success/failure state
  const isSuccess = paymentData?.data.status === "COMPLETED";
  const isPaymentPending = paymentData?.data.status === "PENDING" || paymentData?.data.status === "PROCESSING";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className={`flex items-center justify-center space-x-2 ${
            isSuccess 
              ? "text-green-600" 
              : isPaymentPending
                ? "text-yellow-600"
                : "text-red-600"
          }`}>
            {isSuccess ? (
              <CheckCircle className="h-6 w-6" />
            ) : isPaymentPending ? (
              <AlertCircle className="h-6 w-6" />
            ) : (
              <XCircle className="h-6 w-6" />
            )}
            <span>
              {isSuccess 
                ? "Payment Successful!" 
                : isPaymentPending
                  ? "Payment Pending"
                  : "Payment Failed"
              }
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {paymentData && (
            <div className="space-y-3">
              <p className="text-gray-600">
                {isSuccess 
                  ? "Your payment has been successfully processed!" 
                  : isPaymentPending
                    ? "Your payment is being processed. Please check back later."
                    : "Your payment could not be completed."
                }
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Service:</span>
                  <span>{paymentData.data.booking.service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span>₦{paymentData.data.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`font-medium ${
                    isSuccess 
                      ? "text-green-600" 
                      : isPaymentPending
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}>
                    {paymentData.data.status}
                  </span>
                </div>
                {paymentData.data.paidAt && (
                  <div className="flex justify-between">
                    <span className="font-medium">Paid At:</span>
                    <span>{new Date(paymentData.data.paidAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 font-mono">
                Ref: {paymentData.data.transactionRef}
              </p>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button onClick={handleGoToBookings}>
              Go to My Bookings
            </Button>
            <Button onClick={handleBackHome} variant="outline">
              Go to Dashboard
            </Button>
            {!isSuccess && transactionRef && (
              <Button 
                onClick={handleRetryVerification} 
                variant="secondary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Payment Status"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for using payment verification in other components
export function usePaymentVerification(transactionRef?: string) {
  return useQuery({
    queryKey: ["paymentVerification", transactionRef],
    queryFn: async () => {
      if (!transactionRef) {
        throw new Error("No transaction reference provided");
      }
      return await verifyPayment(transactionRef);
    },
    enabled: !!transactionRef,
    refetchInterval: (data) => {
      // Stop refetching once payment is completed or failed
      const status = data?.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? 5000 : false;
    },
    staleTime: 0,
  });
}
