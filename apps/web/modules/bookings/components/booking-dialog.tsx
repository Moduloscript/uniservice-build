"use client";

import { useState, useEffect } from "react";
import { Button } from "../../ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../ui/components/dialog";
import { createBooking } from "../api";
import type { Service } from "../../services/types";
import type { AvailabilityTimeSlot } from "../../availability/types";
import { AvailabilityCalendar } from "../../availability/components/availability-calendar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Clock, DollarSign, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { PaymentMethodSelector } from "../../payments/components/payment-method-selector";
import { PaymentProcessor } from "../../payments/components/payment-processor";
import { PaymentSuccess } from "../../payments/components/payment-success";
import type { PaymentProvider } from "../../payments/types";
import { useAuth } from "@repo/auth/client";
import { calculatePaymentFees } from "../../payments/utils/fees";

interface BookingDialogProps {
	service: Service;
	triggerText?: string;
	preSelectedSlot?: AvailabilityTimeSlot;
	onSuccess?: () => void;
	children?: React.ReactNode;
}

type BookingStep = 'slot-selection' | 'payment-method' | 'payment-processing' | 'payment-success';

export function BookingDialog({
	service,
	triggerText = "Book This Service",
	preSelectedSlot,
	onSuccess,
	children,
}: BookingDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [currentStep, setCurrentStep] = useState<BookingStep>('slot-selection');
	const [selectedSlot, setSelectedSlot] = useState<AvailabilityTimeSlot | null>(preSelectedSlot || null);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentProvider | undefined>('flutterwave');
	const [bookingId, setBookingId] = useState<string | null>(null);
	const [transactionRef, setTransactionRef] = useState<string | null>(null);
	const [isCreatingBooking, setIsCreatingBooking] = useState(false);
	const [isProcessingPaymentMethod, setIsProcessingPaymentMethod] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();
	const { user } = useAuth();

	// Update selected slot when preSelectedSlot changes
	useEffect(() => {
		if (preSelectedSlot) {
			setSelectedSlot(preSelectedSlot);
		}
	}, [preSelectedSlot]);

	const handleSlotSelect = (slot: AvailabilityTimeSlot) => {
		setSelectedSlot(slot);
	};

		// Reset dialog state when closed
	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			// Reset all state
			setCurrentStep('slot-selection');
			setSelectedSlot(preSelectedSlot || null);
			setSelectedPaymentMethod(undefined);
			setBookingId(null);
			setTransactionRef(null);
			setIsCreatingBooking(false);
			setIsProcessingPaymentMethod(false);
		}
	};

	const constructDateTime = (slot: AvailabilityTimeSlot): Date => {
		let dateString: string;
		let timeString: string;
		
		// Extract date part (handle both ISO string and date-only formats)
		if (slot.date.includes('T')) {
			dateString = slot.date.split('T')[0];
		} else {
			dateString = slot.date;
		}
		
		// Extract time part
		if (slot.startTime.includes('T')) {
			const timeDate = new Date(slot.startTime);
			timeString = timeDate.toTimeString().split(' ')[0];
		} else {
			timeString = slot.startTime;
		}
		
		return new Date(`${dateString}T${timeString}`);
	};

	const handleSlotConfirmation = async () => {
		if (!selectedSlot) {
			toast.error("Please select a time slot from the calendar");
			return;
		}

		const dateTime = constructDateTime(selectedSlot);

		// Validate constructed date
		if (isNaN(dateTime.getTime())) {
			toast.error("Invalid date/time format. Please try selecting another slot.");
			return;
		}

		// Check if date is in the future
		if (dateTime <= new Date()) {
			toast.error("Please select a future date and time");
			return;
		}

		setIsCreatingBooking(true);
		try {
			// Create booking first (with PENDING status)
			const bookingData = {
				serviceId: service.id,
				scheduledFor: dateTime.toISOString(),
			};
			
			const booking = await createBooking(bookingData);
			setBookingId(booking.id);
			
			// Move to payment method selection
			setCurrentStep('payment-method');
			
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setIsCreatingBooking(false);
		}
	};

	const handlePaymentMethodContinue = () => {
		if (!selectedPaymentMethod) {
			toast.error("Please select a payment method");
			return;
		}
		setIsProcessingPaymentMethod(true);
		// Add a small delay to show loading state
		setTimeout(() => {
			setCurrentStep('payment-processing');
			setIsProcessingPaymentMethod(false);
		}, 500);
	};

	const handlePaymentSuccess = (txRef: string) => {
		setTransactionRef(txRef);
		setCurrentStep('payment-success');
		
		// Invalidate queries to refresh data
		queryClient.invalidateQueries({ 
			queryKey: ["serviceAvailability", service.providerId, service.id] 
		});
		queryClient.invalidateQueries({ 
			queryKey: ["provider-availability", service.providerId] 
		});
		queryClient.invalidateQueries({ 
			queryKey: ["bookings"] 
		});
	};

	const handlePaymentFailure = (error: string) => {
		// Stay on payment processing step to allow retry
		toast.error(`Payment failed: ${error}`);
	};

	const handleViewBooking = () => {
		setIsOpen(false);
		router.push("/app/student/bookings");
	};

	const handleBookAnother = () => {
		setIsOpen(false);
		if (onSuccess) {
			onSuccess();
		}
	};

	const handleBackToPaymentMethod = () => {
		setCurrentStep('payment-method');
	};


	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			{children ? (
				<DialogTrigger asChild>{children}</DialogTrigger>
			) : (
				<DialogTrigger asChild>
					<Button className="w-full">{triggerText}</Button>
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{currentStep === 'slot-selection' && `Book ${service.name}`}
						{currentStep === 'payment-method' && `Choose Payment Method`}
						{currentStep === 'payment-processing' && `Complete Payment`}
						{currentStep === 'payment-success' && `Booking Confirmed!`}
					</DialogTitle>
					<DialogDescription>
						{currentStep === 'slot-selection' && 'Select your preferred date and time for this service.'}
						{currentStep === 'payment-method' && 'Choose your preferred payment method to complete your booking.'}
						{currentStep === 'payment-processing' && 'Complete your payment to confirm the booking.'}
						{currentStep === 'payment-success' && 'Your booking has been confirmed successfully!'}
					</DialogDescription>
				</DialogHeader>

				{/* Step 1: Slot Selection */}
				{currentStep === 'slot-selection' && (
					<div className="space-y-4">
						{/* Service Details */}
						<div className="bg-gray-50 p-4 rounded-lg">
							<h4 className="font-medium">{service.name}</h4>
							<p className="text-sm text-gray-600 mt-1">
								{service.description}
							</p>
							<div className="flex justify-between items-center mt-2">
								<span className="text-lg font-bold text-primary">
									₦{service.price.toLocaleString()}
								</span>
								<span className="text-sm text-gray-500">
									{service.duration} min
								</span>
							</div>
						</div>

						{/* Availability Calendar */}
						<AvailabilityCalendar
							providerId={service.providerId}
							serviceId={service.id}
							showBookedSlots
							readonly={false}
							onSlotSelect={handleSlotSelect}
						/>

						{/* Selected Slot Summary */}
						{selectedSlot && (
							<div className="bg-primary/10 p-4 rounded-lg border">
								<div className="flex items-center gap-2 mb-2">
									<Calendar className="h-4 w-4 text-primary" />
									<h5 className="font-medium text-primary">
										Selected Appointment
									</h5>
								</div>
								<div className="flex items-center gap-4 text-sm">
									<div className="flex items-center gap-1">
										<Clock className="h-4 w-4" />
										<span>{selectedSlot.displayTime}</span>
									</div>
									<div className="flex items-center gap-1">
										<Calendar className="h-4 w-4" />
										<span>{new Date(selectedSlot.date).toLocaleDateString()}</span>
									</div>
								</div>
							</div>
						)}

						<div className="flex space-x-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsOpen(false)}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								onClick={handleSlotConfirmation}
								disabled={!selectedSlot || isCreatingBooking}
								loading={isCreatingBooking}
								className="flex-1"
							>
								{isCreatingBooking ? "Creating Booking..." : (selectedSlot ? "Continue to Payment" : "Select a Time Slot")}
							</Button>
						</div>
					</div>
				)}

				{/* Step 2: Payment Method Selection */}
				{currentStep === 'payment-method' && (
					<PaymentMethodSelector
						selectedMethod={selectedPaymentMethod}
						onMethodSelect={setSelectedPaymentMethod}
						onContinue={handlePaymentMethodContinue}
						isLoading={isProcessingPaymentMethod}
						amount={Number(service.price)}
					/>
				)}

				{/* Step 3: Payment Processing */}
				{currentStep === 'payment-processing' && selectedPaymentMethod && bookingId && user && (
					<PaymentProcessor
						provider={selectedPaymentMethod}
						amount={Number(service.price)}
						bookingId={bookingId}
						serviceId={service.id}
						providerId={service.providerId}
						userEmail={user.email}
						userName={user.name}
						onSuccess={handlePaymentSuccess}
						onFailure={handlePaymentFailure}
						onBack={handleBackToPaymentMethod}
					/>
				)}

				{/* Step 4: Payment Success */}
				{currentStep === 'payment-success' && bookingId && transactionRef && selectedSlot && (
					<PaymentSuccess
						bookingId={bookingId}
						transactionRef={transactionRef}
						service={service}
						bookingDateTime={constructDateTime(selectedSlot).toISOString()}
						totalAmount={Number(service.price) + (selectedPaymentMethod ? 
							calculatePaymentFees(selectedPaymentMethod, Number(service.price)) : 0)}
						onViewBooking={handleViewBooking}
						onBookAnother={handleBookAnother}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
