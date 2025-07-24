"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Textarea } from "@ui/components/textarea";
import { Label } from "@ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/components/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getProviderAvailability,
	createAvailabilitySlot,
	updateAvailabilitySlot,
	deleteAvailabilitySlot,
	createBulkAvailabilitySlots,
	createRecurringSchedule,
} from "@/modules/availability/api";
import { fetchServices } from "@/modules/services/api";
import type {
	ProviderAvailability,
	CreateAvailabilitySlot,
	UpdateAvailabilitySlot,
} from "@/modules/availability/types";
import { Alert, AlertDescription } from "@ui/components/alert";
import { AlertCircle, Calendar, Clock, Info } from "lucide-react";

export function UnifiedAvailabilityManager({ providerId }: { providerId: string }) {
	const queryClient = useQueryClient();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// State for new slot creation
	const [newSlot, setNewSlot] = useState<CreateAvailabilitySlot>({
		serviceId: undefined,
		date: "",
		startTime: "",
		endTime: "",
		maxBookings: 1,
		notes: "",
	});

	// Fetch services for the provider
	const { data: services, error: servicesError, isError: isServicesError } = useQuery({
		queryKey: ["services", providerId],
		queryFn: () => fetchServices({ providerId }),
		enabled: !!providerId,
	});

	// Create slot mutation
	const createSlotMutation = useMutation({
		mutationFn: (slot: CreateAvailabilitySlot) => {
			// Format time for API - ensure HH:MM:SS format
			const formatTimeForAPI = (time: string): string => {
				if (!time) return "";
				return time.match(/^\d{2}:\d{2}$/) ? `${time}:00` : time;
			};
			
			const slotForAPI = {
				...slot,
				startTime: formatTimeForAPI(slot.startTime),
				endTime: formatTimeForAPI(slot.endTime),
				// Convert null/undefined serviceId to undefined for API (Zod expects undefined, not null)
				serviceId: slot.serviceId || undefined,
			};
			
			return createAvailabilitySlot(providerId, slotForAPI);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["providerAvailability", providerId] });
			// Also invalidate the availability query used by AvailabilitySlotsList
			queryClient.invalidateQueries({ 
				queryKey: ["provider-availability", providerId, "list"] 
			});
			setSuccess("Availability slot created successfully!");
			setError(null);
			// Reset form to defaults
			setNewSlot({
				serviceId: undefined,
				date: "",
				startTime: "",
				endTime: "",
				maxBookings: 1,
				notes: "",
			});
		},
		onError: (error: any) => {
			console.error("Error creating slot:", error);
			// Extract meaningful error message - handle various error formats
			let errorMessage = "Failed to create availability slot";
			
			if (typeof error === 'string') {
				errorMessage = error;
			} else if (error?.message) {
				errorMessage = error.message;
			} else if (error?.error) {
				errorMessage = error.error;
			} else if (error && typeof error === 'object') {
				// Handle case where error might be an object without message
				errorMessage = JSON.stringify(error);
			}
			
			setError(errorMessage);
			setSuccess(null);
		},
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setNewSlot((prev) => ({ ...prev, [name]: name === "maxBookings" ? Number(value) : value }));
	};

	const validateForm = (): boolean => {
		if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
			setError("Date, start time, and end time are required.");
			return false;
		}
		
		// Validate that end time is after start time
		const startTime = new Date(`${newSlot.date}T${newSlot.startTime}`);
		const endTime = new Date(`${newSlot.date}T${newSlot.endTime}`);
		
		if (endTime <= startTime) {
			setError("End time must be after start time.");
			return false;
		}
		
		// Validate date is not in the past
		const selectedDate = new Date(newSlot.date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		if (selectedDate < today) {
			setError("Cannot create availability slots for past dates.");
			return false;
		}
		
		setError(null);
		return true;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			createSlotMutation.mutate(newSlot);
		}
	};

	// Handle services error with useEffect
	useEffect(() => {
		if (isServicesError && servicesError) {
			console.error("Services query error:", servicesError);
			console.error("Error type:", typeof servicesError);
			console.error("Error keys:", Object.keys(servicesError));
			console.error("Error JSON:", JSON.stringify(servicesError, null, 2));
			
			// Only set error if it's not already set by another operation
			if (!error) {
				let servicesErrorMessage = "Failed to load services";
				
				if (typeof servicesError === 'string') {
					servicesErrorMessage = servicesError;
				} else if (servicesError?.message) {
					servicesErrorMessage = servicesError.message;
				} else if (servicesError?.error) {
					servicesErrorMessage = servicesError.error;
				} else if (servicesError && typeof servicesError === 'object') {
					// Log the full error object for debugging
					console.log("Converting error object to JSON:", servicesError);
					servicesErrorMessage = `Error: ${JSON.stringify(servicesError)}`;
				}
				
				console.log("Setting services error message:", servicesErrorMessage);
				setError(servicesErrorMessage);
			}
		}
	}, [isServicesError, servicesError, error]);

	return (
		<div className="space-y-6">
			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						{typeof error === 'string' ? error : 'An error occurred'}
					</AlertDescription>
				</Alert>
			)}
			{success && (
				<Alert>
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="flex items-center gap-2">
					<Calendar className="h-5 w-5 text-blue-600" />
					<h3 className="text-lg font-medium">Create Availability Slot</h3>
				</div>
				
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div className="flex items-start gap-2">
						<Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
						<div className="text-sm text-blue-800">
							<p className="font-medium mb-1">Quick Guide:</p>
							<ul className="space-y-1 text-xs">
								<li>• Choose a specific service or leave as general availability</li>
								<li>• Set to 1 for individual sessions, higher for group sessions</li>
								<li>• Add notes like "Bring textbook", "Online via Zoom", etc.</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="service">Service (optional)</Label>
					<p className="text-xs text-gray-600 mb-2">Choose a specific service or leave as general availability</p>
					<Select 
						value={newSlot.serviceId || "__general__"} 
						onValueChange={(value) => setNewSlot(prev => ({ ...prev, serviceId: value === "__general__" ? undefined : value }))}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select a service or leave as general availability" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="__general__">General Availability</SelectItem>
							{services?.map((service) => (
								<SelectItem key={service.id} value={service.id}>
									{service.name} - ${service.price}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="date">Date *</Label>
					<p className="text-xs text-gray-600">When will you be available?</p>
					<Input
						id="date"
						type="date"
						value={newSlot.date}
						onChange={handleInputChange}
						name="date"
						min={new Date().toISOString().split('T')[0]}
						required
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="startTime">Start Time *</Label>
						<p className="text-xs text-gray-600">When does your availability begin?</p>
						<div className="relative">
							<Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								id="startTime"
								type="time"
								value={newSlot.startTime}
								onChange={handleInputChange}
								name="startTime"
								className="pl-10"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="endTime">End Time *</Label>
						<p className="text-xs text-gray-600">When does your availability end?</p>
						<div className="relative">
							<Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								id="endTime"
								type="time"
								value={newSlot.endTime}
								onChange={handleInputChange}
								name="endTime"
								className="pl-10"
								required
							/>
						</div>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="maxBookings">Maximum Bookings</Label>
					<p className="text-xs text-gray-600">How many clients can book this time slot? (Set to 1 for individual sessions, higher for group sessions or workshops)</p>
					<Input
						id="maxBookings"
						type="number"
						min="1"
						max="50"
						value={newSlot.maxBookings}
						onChange={handleInputChange}
						name="maxBookings"
						className="w-32"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="notes">Notes (optional)</Label>
					<p className="text-xs text-gray-600">Add any special instructions, requirements, or information for clients</p>
					<Textarea
						id="notes"
						value={newSlot.notes}
						onChange={handleInputChange}
						name="notes"
						placeholder="e.g., 'Bring your textbook', 'Online session via Zoom', 'Advanced level only'"
						rows={3}
					/>
				</div>

				<Button 
					type="submit" 
					disabled={createSlotMutation.isPending}
					className="w-full sm:w-auto"
				>
					{createSlotMutation.isPending ? "Creating..." : "Create Availability Slot"}
				</Button>
			</form>
		</div>
	);
}

