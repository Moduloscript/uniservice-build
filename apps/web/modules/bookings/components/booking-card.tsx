"use client";

import { useState } from "react";
import { Button } from "../../ui/components/button";
import { Card, CardContent, CardFooter, CardHeader } from "../../ui/components/card";
import { BookingStatusBadge } from "./booking-status-badge";
import { updateBookingStatus, cancelBooking } from "../api";
import type { Booking } from "../types";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../ui/components/alert-dialog";

interface BookingCardProps {
	booking: Booking;
	userType: "STUDENT" | "PROVIDER" | "ADMIN";
	onUpdate?: () => void;
}

export function BookingCard({ booking, userType, onUpdate }: BookingCardProps) {
	const [isLoading, setIsLoading] = useState(false);

	const formatDateTime = (dateTime: string) => {
		const date = new Date(dateTime);
		return {
			date: date.toLocaleDateString("en-US", {
				weekday: "short",
				year: "numeric",
				month: "short",
				day: "numeric",
			}),
			time: date.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		};
	};

	const handleStatusUpdate = async (newStatus: string) => {
		setIsLoading(true);
		try {
			await updateBookingStatus(booking.id, { status: newStatus as any });
			toast.success(`Booking ${newStatus.toLowerCase()} successfully!`);
			if (onUpdate) onUpdate();
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = async () => {
		setIsLoading(true);
		try {
			await cancelBooking(booking.id);
			toast.success("Booking cancelled successfully!");
			if (onUpdate) onUpdate();
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	const { date, time } = formatDateTime(booking.dateTime);

	const canConfirm = userType === "PROVIDER" && booking.status === "PENDING";
	const canComplete = userType === "PROVIDER" && booking.status === "CONFIRMED";
	const canCancel = (userType === "STUDENT" && ["PENDING", "CONFIRMED"].includes(booking.status)) ||
					 (userType === "PROVIDER" && booking.status === "PENDING") ||
					 userType === "ADMIN";

	return (
		<Card className="w-full">
			<CardHeader className="pb-3">
				<div className="flex justify-between items-start">
					<div>
						<h3 className="font-semibold text-lg">{booking.service?.name}</h3>
						<p className="text-sm text-gray-600">{booking.service?.category?.name}</p>
					</div>
					<BookingStatusBadge status={booking.status} />
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<span className="font-medium text-gray-700">Date:</span>
						<p>{date}</p>
					</div>
					<div>
						<span className="font-medium text-gray-700">Time:</span>
						<p>{time}</p>
					</div>
				</div>

				{booking.service && (
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="font-medium text-gray-700">Price:</span>
							<p className="text-primary font-semibold">₦{booking.service.price.toLocaleString()}</p>
						</div>
						<div>
							<span className="font-medium text-gray-700">Duration:</span>
							<p>{booking.service.duration} min</p>
						</div>
					</div>
				)}

				{booking.service?.description && (
					<div className="text-sm">
						<span className="font-medium text-gray-700">Description:</span>
						<p className="text-gray-600 mt-1">{booking.service.description}</p>
					</div>
				)}
			</CardContent>

			{(canConfirm || canComplete || canCancel) && (
				<CardFooter className="pt-3 border-t">
					<div className="flex space-x-2 w-full">
						{canConfirm && (
							<Button
								onClick={() => handleStatusUpdate("CONFIRMED")}
								disabled={isLoading}
								className="flex-1"
							>
								Confirm
							</Button>
						)}
						
						{canComplete && (
							<Button
								onClick={() => handleStatusUpdate("COMPLETED")}
								disabled={isLoading}
								variant="outline"
								className="flex-1"
							>
								Mark Complete
							</Button>
						)}

						{canCancel && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="destructive"
										disabled={isLoading}
										className={canConfirm || canComplete ? "flex-1" : "w-full"}
									>
										Cancel
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Cancel Booking</AlertDialogTitle>
										<AlertDialogDescription>
											Are you sure you want to cancel this booking? This action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>No, keep booking</AlertDialogCancel>
										<AlertDialogAction onClick={handleCancel}>
											Yes, cancel booking
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>
				</CardFooter>
			)}
		</Card>
	);
}
