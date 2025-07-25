"use client";

import { Button } from "../../ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/components/card";
import { Badge } from "../../ui/components/badge";
import { CheckCircle, Calendar, Clock, User, MapPin, MessageCircle, Download, Share } from "lucide-react";
import { toast } from "sonner";
import type { Service } from "../../services/types";

interface PaymentSuccessProps {
  bookingId: string;
  transactionRef: string;
  service: Service;
  bookingDateTime: string;
  totalAmount: number;
  onViewBooking: () => void;
  onBookAnother: () => void;
}

export function PaymentSuccess({
  bookingId,
  transactionRef,
  service,
  bookingDateTime,
  totalAmount,
  onViewBooking,
  onBookAnother,
}: PaymentSuccessProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("en-NG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const { date, time } = formatDateTime(bookingDateTime);

  const handleShareBooking = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Booking Confirmed: ${service.name}`,
          text: `I've booked ${service.name} for ${date} at ${time}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `I've booked ${service.name} for ${date} at ${time}. Booking ID: ${bookingId}`;
      await navigator.clipboard.writeText(shareText);
      toast.success("Booking details copied to clipboard!");
    }
  };

  const handleDownloadReceipt = () => {
    // This would typically generate and download a PDF receipt
    toast.info("Receipt download feature coming soon!");
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
          <p className="text-muted-foreground mt-1">
            Your booking has been confirmed and the provider has been notified.
          </p>
        </div>
      </div>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Booking Confirmation</CardTitle>
            <Badge variant="default" className="bg-green-100 text-green-700">
              Confirmed
            </Badge>
          </div>
          <CardDescription>
            Booking ID: {bookingId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service Info */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{service.name}</h4>
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <span>{service.duration} minutes</span>
                  <span>•</span>
                  <span>{formatAmount(service.price)}</span>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{date}</p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {time}
                </p>
              </div>
            </div>

            {/* Provider Info */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Provider Details</p>
                <p className="text-sm text-muted-foreground">
                  You'll receive provider contact information via email shortly.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Paid:</span>
            <span className="font-bold text-green-600">{formatAmount(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Transaction ID:</span>
            <span className="text-sm font-mono">{transactionRef}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Payment Date:</span>
            <span className="text-sm">{new Date().toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">1.</span>
              <span>You'll receive a booking confirmation email with all details</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">2.</span>
              <span>The provider will contact you within 24 hours to confirm arrangements</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">3.</span>
              <span>You'll receive reminders 24 hours and 2 hours before your appointment</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">4.</span>
              <span>After the service, you can leave a review to help other students</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={onViewBooking} variant="default" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            View Booking
          </Button>
          <Button onClick={onBookAnother} variant="outline" className="w-full">
            Book Another Service
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleShareBooking} variant="outline" size="sm" className="w-full">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleDownloadReceipt} variant="outline" size="sm" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Receipt
          </Button>
        </div>
      </div>

      {/* Support */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="font-medium">Need Help?</h4>
            <p className="text-sm text-muted-foreground">
              If you have any questions about your booking, our support team is here to help.
            </p>
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
