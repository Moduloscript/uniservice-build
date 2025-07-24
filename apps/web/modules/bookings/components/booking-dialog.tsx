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

interface BookingDialogProps {
	service: Service;
	triggerText?: string;
	onSuccess?: () => void;
}

export function BookingDialog({
	service,
	triggerText = "Book This Service",
	onSuccess,
}: BookingDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
const [selectedSlot, setSelectedSlot] = useState<AvailabilityTimeSlot | null>(null); // Use AvailabilityTimeSlot

	useEffect(() => {
		if (selectedSlot) {
			setSelectedDate(selectedSlot.date);
			setSelectedTime(selectedSlot.startTime);
		}
	}, [selectedSlot]);

	const handleSlotSelect = (slot: AvailabilityTimeSlot) => {
		setSelectedSlot(slot);
	};
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

if (!selectedSlot) {
		toast.error("Please select a time slot from the calendar");
		return;
	}

		setIsLoading(true);

		try {
			const dateTime = new Date(`${selectedDate}T${selectedTime}`);

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

			toast.success("Booking request sent successfully!");
			setIsOpen(false);
			setSelectedDate("");
			setSelectedTime("");

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

	// Generate time slots (9 AM to 6 PM, 30-minute intervals)
	const generateTimeSlots = () => {
		const slots = [];
		for (let hour = 9; hour < 18; hour++) {
			slots.push(`${hour.toString().padStart(2, "0")}:00`);
			slots.push(`${hour.toString().padStart(2, "0")}:30`);
		}
		return slots;
	};

	// Get minimum date (tomorrow)
	const getMinDate = () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow.toISOString().split("T")[0];
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button className="w-full">{triggerText}</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
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
					<div className="flex items-center justify-between">
						<Calendar className="h-5 w-5" />
						{selectedSlot ? (
							<p>
								{selectedSlot.displayTime}
							</p>
						) : (
							<p className="text-muted-foreground">
								Select a time slot from the calendar
							</p>
						)}
					</div>

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
								disabled={isLoading}
								className="flex-1"
							>
								{isLoading ? "Booking..." : "Confirm Booking"}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
