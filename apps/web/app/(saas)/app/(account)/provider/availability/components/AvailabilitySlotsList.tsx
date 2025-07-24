"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { 
	Calendar, 
	Clock, 
	Users, 
	Edit, 
	Trash2, 
	AlertCircle, 
	Sparkles,
	CalendarDays,
	Timer,
	Star,
	MapPin,
	Activity,
	TrendingUp
} from "lucide-react";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { Skeleton } from "@ui/components/skeleton";
import { Alert, AlertDescription } from "@ui/components/alert";
import {
	providerAvailabilityApi,
	providerAvailabilityQueryKeys,
} from "@/modules/provider/api";

export function AvailabilitySlotsList({ providerId }: { providerId: string }) {
	const queryClient = useQueryClient();

	// Fetch availability data
	const {
		data: availabilityData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: providerAvailabilityQueryKeys.availability(providerId),
		queryFn: () => providerAvailabilityApi.getAvailability(providerId),
		enabled: !!providerId,
		refetchInterval: 30000, // Refetch every 30 seconds
	});

	// Delete slot mutation
	const deleteSlotMutation = useMutation({
		mutationFn: (availabilityId: string) =>
			providerAvailabilityApi.deleteSlot(providerId, availabilityId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: providerAvailabilityQueryKeys.availability(providerId),
			});
		},
	});

	const handleDeleteSlot = (availabilityId: string) => {
		if (confirm("Are you sure you want to delete this availability slot?")) {
			deleteSlotMutation.mutate(availabilityId);
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-primary" />
						Your Availability Slots
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-24 w-full" />
					))}
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
						Your Availability Slots
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Failed to load availability slots. Please try again.
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

	const slots = availabilityData?.data || [];

	if (slots.length === 0) {
		return (
			<Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-dashed">
				<CardHeader>
					<CardTitle className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-lg">
							<Sparkles className="h-5 w-5 text-primary" />
						</div>
						<span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
							Your Availability Calendar
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-12">
						<div className="relative mx-auto mb-6 w-24 h-24">
							<div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full animate-pulse" />
							<CalendarDays className="h-12 w-12 text-primary relative z-10 mx-auto mt-6" />
						</div>
						<h3 className="font-bold text-xl mb-3 text-foreground">
							🚀 Ready to Get Booked?
						</h3>
						<p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
							Start by creating your first availability slot above. 
							Set your schedule and watch students book your amazing services! ✨
						</p>
						<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<Timer className="h-4 w-4" />
								Flexible Hours
							</div>
							<div className="flex items-center gap-1">
								<Users className="h-4 w-4" />
								Multiple Students
							</div>
							<div className="flex items-center gap-1">
								<TrendingUp className="h-4 w-4" />
								Earn More
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Group slots by date
	const slotsByDate = slots.reduce((acc: Record<string, typeof slots>, slot) => {
		const dateKey = slot.date;
		if (!acc[dateKey]) {
			acc[dateKey] = [];
		}
		acc[dateKey].push(slot);
		return acc;
	}, {});

	// Sort dates
	const sortedDates = Object.keys(slotsByDate).sort();

	// Calculate stats
	const totalActiveSlots = slots.filter(slot => slot.isAvailable).length;
	const totalBookings = slots.reduce((sum, slot) => sum + slot.currentBookings, 0);
	const totalCapacity = slots.reduce((sum, slot) => sum + slot.maxBookings, 0);

	return (
		<div className="space-y-6">
			{/* Header with Stats */}
			<Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								<Activity className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h3 className="text-xl font-bold">Your Schedule Overview</h3>
								<p className="text-sm text-muted-foreground">Manage your availability and track bookings</p>
							</div>
						</div>
						<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
							{slots.length} Total Slots
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
							<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
								<CalendarDays className="h-4 w-4 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<p className="text-sm font-medium text-green-800 dark:text-green-200">Active Slots</p>
								<p className="text-xl font-bold text-green-600 dark:text-green-400">{totalActiveSlots}</p>
							</div>
						</div>
						
						<div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
							<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
								<Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<p className="text-sm font-medium text-blue-800 dark:text-blue-200">Current Bookings</p>
								<p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalBookings}</p>
							</div>
						</div>
						
						<div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
							<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
								<TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
							</div>
							<div>
								<p className="text-sm font-medium text-purple-800 dark:text-purple-200">Total Capacity</p>
								<p className="text-xl font-bold text-purple-600 dark:text-purple-400">{totalCapacity}</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Slots by Date */}
			{sortedDates.map((dateKey) => {
				const dateslots = slotsByDate[dateKey];
				
				// Safely format the date with error handling
				let formattedDate: string;
				let dayOfWeek: string;
				try {
					formattedDate = format(parseISO(dateKey), "MMMM d, yyyy");
					dayOfWeek = format(parseISO(dateKey), "EEEE");
				} catch (error) {
					console.warn(`Invalid date format: ${dateKey}`, error);
					formattedDate = dateKey;
					dayOfWeek = "";
				}

				return (
					<Card key={dateKey} className="overflow-hidden">
						<CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 border-b">
							<CardTitle className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-primary/10 rounded-lg">
										<CalendarDays className="h-5 w-5 text-primary" />
									</div>
									<div>
										<h4 className="text-lg font-semibold">{dayOfWeek}</h4>
										<p className="text-sm text-muted-foreground">{formattedDate}</p>
									</div>
								</div>
								<Badge variant="secondary" className="bg-primary/10 text-primary">
									{dateslots.length} slots
								</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6">
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{dateslots
									.sort((a, b) => a.startTime.localeCompare(b.startTime))
									.map((slot) => {
										// Format time display with validation
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

										const startTime = formatTime(slot.startTime);
										const endTime = formatTime(slot.endTime);

										return (
											<div
												key={slot.id}
												className="p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
											>
												<div className="flex items-start justify-between mb-3">
													<div className="flex items-center gap-2">
														<Clock className="h-4 w-4 text-primary" />
														<span className="font-semibold">
															{startTime} - {endTime}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<Badge
															variant={slot.isAvailable ? "default" : "secondary"}
															className="text-xs"
														>
															{slot.isAvailable ? "Available" : "Unavailable"}
														</Badge>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDeleteSlot(slot.id)}
															disabled={deleteSlotMutation.isPending}
															className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</div>

												<div className="space-y-2 text-sm">
													{slot.service && (
														<div className="flex items-center gap-2">
															<span className="text-muted-foreground">Service:</span>
															<span className="font-medium">{slot.service.name}</span>
														</div>
													)}

													<div className="flex items-center gap-4">
														<div className="flex items-center gap-1">
															<Users className="h-4 w-4 text-muted-foreground" />
															<span className="text-muted-foreground">
																Max Bookings:
															</span>
															<span className="font-medium">{slot.maxBookings}</span>
														</div>

														{slot.currentBookings > 0 && (
															<div className="flex items-center gap-1">
																<span className="text-muted-foreground">
																	Current Bookings:
																</span>
																<span className="font-medium text-primary">
																	{slot.currentBookings}
																</span>
															</div>
														)}
													</div>

													{slot.notes && (
														<div className="mt-2 p-2 bg-muted/50 rounded text-xs">
															<span className="text-muted-foreground">Notes:</span>{" "}
															{slot.notes}
														</div>
													)}
												</div>
											</div>
										);
									})}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
