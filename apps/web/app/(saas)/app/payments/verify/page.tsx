"use client";

import { Suspense } from "react";
import { PaymentVerification } from "../../../../../modules/bookings/components/payment-verification";

function PaymentVerifyContent() {
  return (
    <PaymentVerification
      onVerificationComplete={(success, transactionRef) => {
        console.log(`Payment verification complete: ${success ? 'Success' : 'Failed'} - ${transactionRef}`);
      }}
      successRedirect="/app/student/bookings"
      failureRedirect="/app/student/bookings"
    />
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payment verification...</p>
        </div>
      </div>
    }>
      <PaymentVerifyContent />
    </Suspense>
  );
}
