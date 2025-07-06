"use client";

import { useEffect, useState } from "react";
import { BookingCard } from "./booking-card";
import { fetchBookings } from "../api";
import type { Booking } from "../types";
import { Button } from "../../ui/components/button";
import { RefreshCw } from "lucide-react";

interface BookingListProps {
	userType: "STUDENT" | "PROVIDER" | "ADMIN";
	title?: string;
	showRefresh?: boolean;
}

export function BookingList({ 
	userType, 
	title = "My Bookings",
	showRefresh = true 
}: BookingListProps) {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadBookings = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await fetchBookings();
			setBookings(data);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadBookings();
	}, []);

	const handleRefresh = () => {
		loadBookings();
	};

	const getEmptyMessage = () => {
		switch (userType) {
			case "STUDENT":
				return "You haven't made any bookings yet. Browse services to get started!";
			case "PROVIDER":
				return "No booking requests yet. Students will see your services and can book them.";
			case "ADMIN":
				return "No bookings in the system yet.";
			default:
				return "No bookings found.";
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold">{title}</h2>
				</div>
				<div className="grid gap-4">
					{/* Loading skeletons */}
					{[1, 2, 3].map((i) => (
						<div key={i} className="border rounded-lg p-4 animate-pulse">
							<div className="flex justify-between items-start mb-3">
								<div className="space-y-2">
									<div className="h-5 bg-gray-200 rounded w-48"></div>
									<div className="h-4 bg-gray-200 rounded w-32"></div>
								</div>
								<div className="h-6 bg-gray-200 rounded-full w-20"></div>
							</div>
							<div className="space-y-2">
								<div className="h-4 bg-gray-200 rounded w-full"></div>
								<div className="h-4 bg-gray-200 rounded w-3/4"></div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold">{title}</h2>
					{showRefresh && (
						<Button onClick={handleRefresh} variant="outline" size="sm">
							<RefreshCw className="h-4 w-4 mr-2" />
							Try Again
						</Button>
					)}
				</div>
				<div className="text-center py-8">
					<div className="text-red-600 mb-2">Failed to load bookings</div>
					<div className="text-gray-500 text-sm">{error}</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">{title}</h2>
				{showRefresh && bookings.length > 0 && (
					<Button onClick={handleRefresh} variant="outline" size="sm">
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</Button>
				)}
			</div>

			{bookings.length === 0 ? (
				<div className="text-center py-12">
					<div className="text-gray-500 text-lg mb-2">No bookings found</div>
					<div className="text-gray-400 text-sm max-w-md mx-auto">
						{getEmptyMessage()}
					</div>
				</div>
			) : (
				<div className="grid gap-4">
					{bookings.map((booking) => (
						<BookingCard
							key={booking.id}
							booking={booking}
							userType={userType}
							onUpdate={loadBookings}
						/>
					))}
				</div>
			)}
		</div>
	);
}
