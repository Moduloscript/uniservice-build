"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { Button } from "../../ui/components/button";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { initializePayment, verifyPayment } from "../api";
import type { Booking } from "../types";
import type { 
  PaymentInitializeRequest, 
  PaymentInitializeResponse 
} from "../api";

interface PaymentButtonProps {
  booking: Booking;
  onPaymentSuccess?: (transactionRef: string) => void;
  onPaymentError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  redirectUrl?: string;
}

interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    phone_number?: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo?: string;
  };
  meta?: {
    booking_id: string;
    service_id: string;
    provider_id: string;
    student_id: string;
  };
}

// Query key factory
const paymentKeys = {
  initialize: (bookingId: string) => ["payment", "initialize", bookingId] as const,
  verify: (transactionRef: string) => ["payment", "verify", transactionRef] as const,
};

export function PaymentButton({
  booking,
  onPaymentSuccess,
  onPaymentError,
  className,
  disabled = false,
  variant = "default",
  size = "default",
  redirectUrl,
}: PaymentButtonProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentInitializeResponse | null>(null);
  const queryClient = useQueryClient();

  // Initialize payment mutation
  const initializePaymentMutation = useMutation({
    mutationFn: async (data: PaymentInitializeRequest) => {
      return await initializePayment(data);
    },
    onSuccess: (data) => {
      setPaymentData(data);
      // Cache the payment data
      queryClient.setQueryData(
        paymentKeys.initialize(booking.id),
        data
      );
    },
    onError: (error: Error) => {
      console.error("Payment initialization failed:", error);
      toast.error(error.message || "Failed to initialize payment");
      onPaymentError?.(error.message);
    },
  });

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async (transactionRef: string) => {
      return await verifyPayment(transactionRef);
    },
    onSuccess: (data) => {
      if (data.data.status === "COMPLETED") {
        toast.success("Payment successful!");
        onPaymentSuccess?.(data.data.transactionRef);
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
        queryClient.invalidateQueries({ 
          queryKey: ["booking", booking.id] 
        });
        queryClient.invalidateQueries({
          queryKey: ["serviceAvailability", booking.service?.providerId, booking.service?.id]
        });
      } else {
        toast.error(`Payment ${data.data.status.toLowerCase()}`);
        onPaymentError?.(data.data.status);
      }
    },
    onError: (error: Error) => {
      console.error("Payment verification failed:", error);
      toast.error(error.message || "Failed to verify payment");
      onPaymentError?.(error.message);
    },
  });

  // Configure Flutterwave
  const flutterwaveConfig: FlutterwaveConfig | null = paymentData ? {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "",
    tx_ref: paymentData.data.transactionRef,
    amount: paymentData.data.amount,
    currency: paymentData.data.currency,
    payment_options: "card,banktransfer,ussd",
    customer: {
      email: booking.student?.email || "",
      phone_number: booking.student?.phone || undefined,
      name: booking.student?.name || "",
    },
    customizations: {
      title: "UniService Payment",
      description: `Payment for ${paymentData.data.service.name}`,
      logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    },
    meta: {
      booking_id: booking.id,
      service_id: booking.service?.id || "",
      provider_id: booking.providerId || "",
      student_id: booking.studentId || "",
    },
  } : null;

  const handleFlutterPayment = useFlutterwave(flutterwaveConfig || {});

  const handlePayment = async () => {
    try {
      setIsInitializing(true);

      // Step 1: Initialize payment
      if (!paymentData) {
        await initializePaymentMutation.mutateAsync({
          bookingId: booking.id,
          redirectUrl: redirectUrl,
        });
        setIsInitializing(false);
        return;
      }

      // Step 2: Launch Flutterwave payment modal
      handleFlutterPayment({
        callback: async (response) => {
          console.log("Flutterwave response:", response);
          
          if (response.status === "successful") {
            // Verify payment on our backend
            await verifyPaymentMutation.mutateAsync(response.tx_ref);
          } else {
            toast.error("Payment was not completed successfully");
            onPaymentError?.("Payment cancelled or failed");
          }
          
          closePaymentModal();
        },
        onClose: () => {
          console.log("Payment modal closed");
          // Reset payment data to allow retry
          setPaymentData(null);
        },
      });

    } catch (error) {
      console.error("Payment error:", error);
      toast.error("An error occurred while processing payment");
      onPaymentError?.(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsInitializing(false);
    }
  };

  // Check if we can make payments
  const canPay = booking.status === "PENDING" && 
                 !disabled && 
                 !initializePaymentMutation.isPending && 
                 !verifyPaymentMutation.isPending &&
                 !isInitializing;

  const isLoading = initializePaymentMutation.isPending || 
                   verifyPaymentMutation.isPending || 
                   isInitializing;

  const buttonText = () => {
    if (isInitializing) return "Initializing...";
    if (initializePaymentMutation.isPending) return "Preparing Payment...";
    if (verifyPaymentMutation.isPending) return "Verifying Payment...";
    if (paymentData) return "Continue Payment";
    return "Pay Now";
  };

  const getButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (booking.status !== "PENDING") {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <CreditCard className="h-4 w-4" />;
  };

  // Show different states based on booking status
  if (booking.status === "CONFIRMED") {
    return (
      <Button 
        variant="outline" 
        size={size} 
        disabled 
        className={className}
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        Already Paid
      </Button>
    );
  }

  if (booking.status === "CANCELLED") {
    return (
      <Button 
        variant="outline" 
        size={size} 
        disabled 
        className={className}
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        Booking Cancelled
      </Button>
    );
  }

  if (booking.status !== "PENDING") {
    return (
      <Button 
        variant="outline" 
        size={size} 
        disabled 
        className={className}
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        Cannot Pay ({booking.status})
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={!canPay}
      variant={variant}
      size={size}
      className={className}
    >
      {getButtonIcon()}
      <span className="ml-2">{buttonText()}</span>
    </Button>
  );
}

// Hook for payment queries
export function usePaymentInitialize(bookingId: string, enabled = false) {
  return useQuery({
    queryKey: paymentKeys.initialize(bookingId),
    queryFn: async () => {
      return await initializePayment({ bookingId });
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

export function usePaymentVerify(transactionRef: string, enabled = false) {
  return useQuery({
    queryKey: paymentKeys.verify(transactionRef),
    queryFn: async () => {
      return await verifyPayment(transactionRef);
    },
    enabled: enabled && !!transactionRef,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds while enabled
  });
}
