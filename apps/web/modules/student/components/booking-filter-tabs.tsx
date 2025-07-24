"use client";

import { Tabs, TabsList, TabsTrigger } from "@/modules/ui/components/tabs";
import { Badge } from "@/modules/ui/components/badge";
import { BookingFilters } from "../api";

interface BookingFilterTabsProps {
	currentStatus: BookingFilters["status"];
	onStatusChange: (status: BookingFilters["status"]) => void;
	counts?: {
		all: number;
		upcoming: number;
		completed: number;
		cancelled: number;
		pending: number;
		confirmed: number;
	};
}

export function BookingFilterTabs({
	currentStatus,
	onStatusChange,
	counts,
}: BookingFilterTabsProps) {
	const tabs = [
		{
			value: "all" as const,
			label: "All Bookings",
			count: counts?.all,
		},
		{
			value: "upcoming" as const,
			label: "Upcoming",
			count: counts?.upcoming,
		},
		{
			value: "completed" as const,
			label: "Completed",
			count: counts?.completed,
		},
		{
			value: "pending" as const,
			label: "Pending",
			count: counts?.pending,
		},
		{
			value: "confirmed" as const,
			label: "Confirmed",
			count: counts?.confirmed,
		},
		{
			value: "cancelled" as const,
			label: "Cancelled",
			count: counts?.cancelled,
		},
	];

	return (
		<Tabs value={currentStatus} onValueChange={onStatusChange} className="w-full">
			<TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
				{tabs.map((tab) => (
					<TabsTrigger
						key={tab.value}
						value={tab.value}
						className="flex items-center gap-2 text-xs md:text-sm"
					>
						<span>{tab.label}</span>
						{typeof tab.count === "number" && (
							<Badge
								variant="secondary"
								className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
							>
								{tab.count}
							</Badge>
						)}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
