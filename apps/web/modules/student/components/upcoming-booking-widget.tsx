"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/avatar";
import {
	Calendar,
	Clock,
	MapPin,
	ArrowRight,
	CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { StudentBooking } from "../api";

interface UpcomingBookingWidgetProps {
	bookings: StudentBooking[];
	isLoading?: boolean;
}

export function UpcomingBookingWidget({
	bookings,
	isLoading,
}: UpcomingBookingWidgetProps) {
	if (isLoading) {
		return (
			<Card className="group hover:shadow-lg transition-all duration-300">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-lg font-semibold flex items-center gap-2">
								<Calendar className="h-5 w-5 text-primary" />
								Upcoming Bookings
							</CardTitle>
							<CardDescription>Your scheduled sessions</CardDescription>
						</div>
						<div className="animate-pulse bg-muted rounded h-4 w-8" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="animate-pulse">
								<div className="flex items-center space-x-3">
									<div className="w-10 h-10 bg-muted rounded-full" />
									<div className="flex-1 space-y-2">
										<div className="h-4 bg-muted rounded w-3/4" />
										<div className="h-3 bg-muted rounded w-1/2" />
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (bookings.length === 0) {
		return (
			<Card className="group hover:shadow-lg transition-all duration-300">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-lg font-semibold flex items-center gap-2">
								<Calendar className="h-5 w-5 text-primary" />
								Upcoming Bookings
							</CardTitle>
							<CardDescription>Your scheduled sessions</CardDescription>
						</div>
						<Badge variant="secondary" className="text-xs">
							0
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
						<p className="text-muted-foreground text-sm">
							No upcoming bookings
						</p>
						<p className="text-muted-foreground text-xs mt-1">
							Book a service to see it here
						</p>
						<Button asChild className="mt-4" size="sm">
							<Link href="/app/services">Browse Services</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="group hover:shadow-lg transition-all duration-300">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-lg font-semibold flex items-center gap-2">
							<Calendar className="h-5 w-5 text-primary" />
							Upcoming Bookings
						</CardTitle>
						<CardDescription>Your scheduled sessions</CardDescription>
					</div>
					<Badge variant="secondary" className="text-xs">
						{bookings.length}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{bookings.map((booking) => (
						<div
							key={booking.id}
							className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
						>
							<div className="flex items-center space-x-3">
								<Avatar className="h-10 w-10">
									<AvatarImage
										src={booking.provider.image}
										alt={booking.provider.name}
									/>
									<AvatarFallback>
										{booking.provider.name
											.split(" ")
											.map((n) => n[0])
											.join("")
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<p className="font-medium text-sm leading-none">
										{booking.service.name}
									</p>
									<div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
										<span className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											{format(new Date(booking.dateTime), "MMM d, h:mm a")}
										</span>
										<Badge
											variant={
												booking.status === "CONFIRMED" ? "default" : "secondary"
											}
											className="text-xs"
										>
											{booking.status.toLowerCase()}
										</Badge>
									</div>
								</div>
							</div>
							<div className="text-right">
								<p className="font-medium text-sm">
									₦{booking.service.price.toLocaleString()}
								</p>
								<p className="text-xs text-muted-foreground">
									{booking.service.category.name}
								</p>
							</div>
						</div>
					))}
				</div>
				{bookings.length > 0 && (
					<div className="mt-4 pt-4 border-t">
						<Button asChild variant="outline" size="sm" className="w-full">
							<Link href="/app/student/bookings" className="flex items-center">
								View All Bookings
								<ArrowRight className="h-4 w-4 ml-2" />
							</Link>
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
