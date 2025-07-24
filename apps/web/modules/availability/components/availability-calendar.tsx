"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, parseISO, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { Calendar, Clock, Users, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { Skeleton } from "@ui/components/skeleton";
import { Alert, AlertDescription } from "@ui/components/alert";
import { getServiceAvailability } from "../api";
import type {
	AvailabilityCalendarProps,
	AvailabilityTimeSlot,
	ProviderAvailability,
} from "../types";

export function AvailabilityCalendar({
	providerId,
	serviceId,
	onSlotSelect,
	showBookedSlots = false,
	readonly = true,
}: AvailabilityCalendarProps) {
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [selectedSlot, setSelectedSlot] =
		useState<AvailabilityTimeSlot | null>(null);

	// Fetch availability data
	const {
		data: availabilityData = [],
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["serviceAvailability", providerId, serviceId],
		queryFn: () => getServiceAvailability(providerId, serviceId!),
		enabled: !!providerId && !!serviceId,
		refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
	});

	// Transform availability data into time slots
	const timeSlots = useMemo(() => {
		return availabilityData.map(
			(slot: ProviderAvailability): AvailabilityTimeSlot => {
				const date = slot.date;
				const startTime = slot.startTime;
				const endTime = slot.endTime;

				// Format display time with error handling
				const formatTime = (timeString: string): string => {
					try {
						// Handle different time formats
						if (timeString.includes('T')) {
							// If it's already an ISO string
							return format(parseISO(timeString), "h:mm a");
						}

						// If it's just time (HH:MM:SS format)
						if (timeString.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
							return format(parseISO(`1970-01-01T${timeString}`), "h:mm a");
						}

						// Fallback: return the original string
						return timeString;
					} catch (error) {
						console.warn(`Invalid time format: ${timeString}`, error);
						return timeString; // Return original if parsing fails
					}
				};

				const startTimeFormatted = formatTime(startTime);
				const endTimeFormatted = formatTime(endTime);
				const displayTime = `${startTimeFormatted} - ${endTimeFormatted}`;

				return {
					id: slot.id,
					date,
					startTime,
					endTime,
					isAvailable: slot.isAvailable,
					isBooked: slot.isBooked,
					availableSpots: slot.maxBookings - slot.currentBookings,
					totalSpots: slot.maxBookings,
					displayTime,
					service: slot.service,
				};
			},
		);
	}, [availabilityData]);

	// Get available dates
	const availableDates = useMemo(() => {
		const dates = new Set<string>();
		timeSlots.forEach((slot) => {
			if (slot.isAvailable && (showBookedSlots || !slot.isBooked)) {
				dates.add(slot.date);
			}
		});
		return Array.from(dates).map((date) => {
			try {
				return parseISO(date);
			} catch (error) {
				console.warn(`Invalid date format: ${date}`, error);
				return new Date(); // Fallback to today
			}
		}).filter(date => !isNaN(date.getTime())); // Filter out invalid dates
	}, [timeSlots, showBookedSlots]);

	// Get time slots for selected date
	const slotsForSelectedDate = useMemo(() => {
		const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
		return timeSlots.filter((slot) => {
			try {
				const slotDate = format(parseISO(slot.date), "yyyy-MM-dd");
				return (
					slotDate === selectedDateStr &&
					slot.isAvailable &&
					(showBookedSlots || !slot.isBooked)
				);
			} catch (error) {
				console.warn(`Invalid slot date format: ${slot.date}`, error);
				return false;
			}
		});
	}, [timeSlots, selectedDate, showBookedSlots]);

	// Handle slot selection
	const handleSlotSelect = (slot: AvailabilityTimeSlot) => {
		if (readonly || slot.isBooked || slot.availableSpots === 0) return;

		setSelectedSlot(slot);
		onSlotSelect?.(slot);
	};

	// Generate next 14 days for date selection
	const next14Days = useMemo(() => {
		const days = [];
		for (let i = 0; i < 14; i++) {
			const date = addDays(new Date(), i);
			const hasAvailability = availableDates.some((availableDate) =>
				isSameDay(availableDate, date),
			);
			days.push({
				date,
				hasAvailability,
				isToday: isSameDay(date, new Date()),
			});
		}
		return days;
	}, [availableDates]);

	// Auto-select first available date
	useEffect(() => {
		if (
			availableDates.length > 0 &&
			!availableDates.some((date) => isSameDay(date, selectedDate))
		) {
			setSelectedDate(availableDates[0]);
		}
	}, [availableDates, selectedDate]);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-primary" />
						Booking Calendar
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-7 gap-2">
						{Array.from({ length: 14 }).map((_, i) => (
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</div>
					<div className="space-y-2">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-primary" />
						Booking Calendar
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertDescription>
							Failed to load availability. Please try again.
							<Button
								variant="outline"
								size="sm"
								onClick={() => refetch()}
								className="ml-2"
							>
								Retry
							</Button>
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	if (timeSlots.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-primary" />
						Booking Calendar
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="font-semibold text-lg mb-2">
							No Availability Yet
						</h3>
						<p className="text-muted-foreground">
							The provider hasn't set up their availability
							schedule yet.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="h-5 w-5 text-primary" />
					Booking Calendar
				</CardTitle>
				{!readonly && (
					<p className="text-sm text-muted-foreground">
						Select a time slot to book this service
					</p>
				)}
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Date Selection */}
				<div>
					<h4 className="font-medium mb-3">Select Date</h4>
					<div className="grid grid-cols-7 gap-2">
						{next14Days.map(
							({ date, hasAvailability, isToday }) => (
								<Button
									key={date.toISOString()}
									variant={
										isSameDay(date, selectedDate)
											? "default"
											: "outline"
									}
									size="sm"
									disabled={!hasAvailability}
									onClick={() => setSelectedDate(date)}
									className={`flex flex-col h-auto p-2 text-xs ${
										isToday
											? "ring-2 ring-primary ring-offset-2"
											: ""
									}`}
								>
									<span className="font-medium">
										{format(date, "MMM")}
									</span>
									<span className="text-lg font-bold">
										{format(date, "d")}
									</span>
									<span className="text-xs">
										{format(date, "EEE")}
									</span>
									{hasAvailability && (
										<div className="w-1 h-1 bg-green-500 rounded-full mt-1" />
									)}
								</Button>
							),
						)}
					</div>
				</div>

				{/* Time Slots */}
				<div>
					<h4 className="font-medium mb-3">
						Available Times - {format(selectedDate, "EEEE, MMMM d")}
					</h4>

					{slotsForSelectedDate.length === 0 ? (
						<div className="text-center py-6">
							<Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
							<p className="text-muted-foreground">
								No available time slots for this date
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
							{slotsForSelectedDate.map((slot) => (
								<Button
									key={slot.id}
									variant={
										selectedSlot?.id === slot.id
											? "default"
											: "outline"
									}
									size="lg"
									disabled={
										readonly ||
										slot.isBooked ||
										slot.availableSpots === 0
									}
									onClick={() => handleSlotSelect(slot)}
									className="flex flex-col h-auto p-4 space-y-2"
								>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4" />
										<span className="font-semibold">
											{slot.displayTime}
										</span>
									</div>

									<div className="flex items-center gap-4 text-xs">
										<div className="flex items-center gap-1">
											<Users className="h-3 w-3" />
											<span>
												{slot.availableSpots} /{" "}
												{slot.totalSpots}
											</span>
										</div>

										{slot.isBooked ? (
											<Badge
												variant="secondary"
												className="text-xs"
											>
												Booked
											</Badge>
										) : slot.availableSpots === 0 ? (
											<Badge
												variant="destructive"
												className="text-xs"
											>
												Full
											</Badge>
										) : (
											<Badge
												variant="default"
												className="text-xs"
											>
												Available
											</Badge>
										)}
									</div>

									{selectedSlot?.id === slot.id && (
										<div className="flex items-center gap-1 text-xs text-green-600">
											<CheckCircle className="h-3 w-3" />
											Selected
										</div>
									)}
								</Button>
							))}
						</div>
					)}
				</div>

				{/* Booking Instructions */}
				{!readonly && slotsForSelectedDate.length > 0 && (
					<div className="bg-muted/50 p-4 rounded-lg">
						<h5 className="font-medium mb-2">
							Booking Instructions
						</h5>
						<ul className="text-sm text-muted-foreground space-y-1">
							<li>• Select your preferred time slot above</li>
							<li>
								• Click "Book Now" to proceed with your booking
							</li>
							<li>
								• You'll receive a confirmation email once
								booked
							</li>
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
