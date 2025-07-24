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

interface BookingDialogProps {
	service: Service;
	triggerText?: string;
	preSelectedSlot?: AvailabilityTimeSlot;
	onSuccess?: () => void;
	children?: React.ReactNode;
}

export function BookingDialog({
	service,
	triggerText = "Book This Service",
	preSelectedSlot,
	onSuccess,
	children,
}: BookingDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
const [selectedSlot, setSelectedSlot] = useState<AvailabilityTimeSlot | null>(preSelectedSlot || null);
	const router = useRouter();
	const queryClient = useQueryClient();

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
			// Reset to preSelectedSlot if provided, otherwise null
			setSelectedSlot(preSelectedSlot || null);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

if (!selectedSlot) {
		toast.error("Please select a time slot from the calendar");
		return;
	}

		setIsLoading(true);

		try {
			// Create ISO datetime string from selected slot
			const dateTime = new Date(`${selectedSlot.date}T${selectedSlot.startTime}`);

			// Check if date is in the future
			if (dateTime <= new Date()) {
				toast.error("Please select a future date and time");
				setIsLoading(false);
				return;
			}

		await createBooking({
			serviceId: service.id,
			dateTime: dateTime.toISOString(),
		});

		// Invalidate availability queries to show real-time updates
		queryClient.invalidateQueries({ 
			queryKey: ["serviceAvailability", service.providerId, service.id] 
		});
		queryClient.invalidateQueries({ 
			queryKey: ["provider-availability", service.providerId] 
		});
		queryClient.invalidateQueries({ 
			queryKey: ["bookings"] 
		});

		toast.success("Booking created successfully! Availability updated in real-time.");
		setIsOpen(false);
		setSelectedSlot(null); // Reset selected slot

		if (onSuccess) {
			onSuccess();
		} else {
			router.push("/bookings");
		}
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setIsLoading(false);
		}
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
					<DialogTitle>Book {service.name}</DialogTitle>
					<DialogDescription>
						Select your preferred date and time for this service.
					</DialogDescription>
				</DialogHeader>

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

				{/* Booking Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
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
								type="submit"
								disabled={isLoading || !selectedSlot}
								className="flex-1"
							>
								{isLoading ? "Booking..." : selectedSlot ? "Confirm Booking" : "Select a Time Slot"}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
