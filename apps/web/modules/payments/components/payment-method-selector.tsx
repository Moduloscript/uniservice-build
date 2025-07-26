"use client";

import { useState } from "react";
import { Button } from "../../ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/components/card";
import { RadioGroup, RadioGroupItem } from "../../ui/components/radio-group";
import { Label } from "../../ui/components/label";
import { Badge } from "../../ui/components/badge";
import { CreditCard, Shield, Zap, Info } from "lucide-react";
import type { PaymentProvider, PaymentMethodOption, PaymentChannel } from "../types";
import { calculatePaymentFees, calculateTotalAmount, formatNairaAmount, getFeeDescription } from "../utils/fees";

interface PaymentMethodSelectorProps {
  selectedMethod?: PaymentProvider;
  onMethodSelect: (method: PaymentProvider, channels?: PaymentChannel[]) => void;
  onContinue: () => void;
  disabled?: boolean;
  amount: number;
  currency?: string;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "paystack",
    name: "Paystack",
    description: "Secure payments powered by Paystack. Supports cards, bank transfers, USSD, and mobile money.",
    icon: "💳",
    fees: "1.5% (₦100 min, ₦2,000 max)",
    supported: true,
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    description: "Fast and reliable payments with Flutterwave. Multiple payment options available.",
    icon: "🚀",
    fees: "1.4% (₦10 minimum)",
    supported: true, // Enabled for production use
  },
];

const PAYSTACK_CHANNELS = [
  { id: 'card' as PaymentChannel, name: 'Cards', description: 'Visa, Mastercard, Verve' },
  { id: 'bank' as PaymentChannel, name: 'Bank Transfer', description: 'Direct bank transfer' },
  { id: 'ussd' as PaymentChannel, name: 'USSD', description: 'Mobile banking codes' },
  { id: 'mobile_money' as PaymentChannel, name: 'Mobile Money', description: 'Mobile wallet payments' },
];

export function PaymentMethodSelector({
  selectedMethod,
  onMethodSelect,
  onContinue,
  disabled = false,
  amount,
  currency = "NGN",
}: PaymentMethodSelectorProps) {
  const [hoveredMethod, setHoveredMethod] = useState<PaymentProvider | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<PaymentChannel[]>(['card']);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Choose Payment Method</h3>
        <p className="text-sm text-muted-foreground">
          Select your preferred payment provider to complete your booking
        </p>
      </div>

      {/* Amount Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Service Amount:</span>
            <span className="font-medium">{formatNairaAmount(amount)}</span>
          </div>
          {selectedMethod && (
            <>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">Payment Fees:</span>
                <span className="text-sm">
                  {formatNairaAmount(calculatePaymentFees(selectedMethod, amount))}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold text-lg">
                    {formatNairaAmount(calculateTotalAmount(selectedMethod, amount))}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Options */}
      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => onMethodSelect(value as PaymentProvider, selectedChannels)}
        className="space-y-3"
        disabled={disabled}
      >
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method.id}
            className={`relative transition-all duration-200 ${
              hoveredMethod === method.id ? "scale-[1.02]" : ""
            }`}
            onMouseEnter={() => setHoveredMethod(method.id)}
            onMouseLeave={() => setHoveredMethod(null)}
          >
            <Label
              htmlFor={method.id}
              className="cursor-pointer"
            >
              <Card className={`border-2 transition-all duration-200 hover:shadow-md ${
                selectedMethod === method.id 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              } ${!method.supported ? "opacity-50 cursor-not-allowed" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={method.id} 
                          id={method.id}
                          disabled={!method.supported || disabled}
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <CardTitle className="text-base">{method.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {method.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant="secondary" className="text-xs">
                        {method.fees}
                      </Badge>
                      {!method.supported && (
                        <Badge variant="destructive" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {/* Additional Info */}
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>Instant</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CreditCard className="h-3 w-3" />
                      <span>Multiple Options</span>
                    </div>
                  </div>
                  
                  {selectedMethod === method.id && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium mb-1">What happens next:</p>
                          <ul className="space-y-1">
                            <li>• You'll be redirected to {method.name}'s secure payment page</li>
                            <li>• Complete your payment using your preferred method</li>
                            <li>• Return to our platform to view your confirmed booking</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Continue Button */}
      <Button
        onClick={onContinue}
        disabled={!selectedMethod || disabled}
        className="w-full"
        size="lg"
      >
        {selectedMethod 
          ? `Continue with ${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}` 
          : "Select Payment Method"
        }
      </Button>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center space-x-1">
          <Shield className="h-3 w-3" />
          <span>Your payment information is secure and encrypted</span>
        </p>
      </div>
    </div>
  );
}
