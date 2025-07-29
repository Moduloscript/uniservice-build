"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/modules/ui/components/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/modules/ui/components/dropdown-menu";
import { Button } from "@/modules/ui/components/button";
import { Badge } from "@/modules/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/ui/components/avatar";
import { Card, CardContent } from "@/modules/ui/components/card";
import { Skeleton } from "@/modules/ui/components/skeleton";
import {
	ArrowUpDown,
	MoreHorizontal,
	Eye,
	Calendar,
	Clock,
	User,
	DollarSign,
	MessageCircle,
} from "lucide-react";
import { DetailedStudentBooking, BookingFilters } from "../api";
import { BookingStatusBadge } from "@/modules/bookings/components/booking-status-badge";
import Link from "next/link";

interface BookingDataTableProps {
	bookings: DetailedStudentBooking[];
	isLoading?: boolean;
	sortBy: BookingFilters["sortBy"];
	sortOrder: BookingFilters["sortOrder"];
	onSort: (sortBy: BookingFilters["sortBy"]) => void;
	onViewDetails: (bookingId: string) => void;
}

export function BookingDataTable({
	bookings,
	isLoading,
	sortBy,
	sortOrder,
	onSort,
	onViewDetails,
}: BookingDataTableProps) {
	if (isLoading) {
		return <BookingDataTableSkeleton />;
	}

	if (bookings.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<Calendar className="h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">No bookings found</h3>
					<p className="text-muted-foreground text-center">
						You haven't made any bookings yet. Start exploring services to make your first booking.
					</p>
				</CardContent>
			</Card>
		);
	}

	const getSortIcon = (column: BookingFilters["sortBy"]) => {
		if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
		return (
			<ArrowUpDown
				className={`h-4 w-4 ${
					sortOrder === "asc" ? "rotate-180" : ""
				}`}
			/>
		);
	};

	return (
		<div className="space-y-4">
			{/* Desktop Table View */}
			<div className="hidden md:block">
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Service & Provider</TableHead>
								<TableHead>
									<Button
										variant="ghost"
										onClick={() => onSort("scheduledFor")}
										className="h-auto p-0 font-semibold"
									>
										Date & Time
											{getSortIcon("scheduledFor")}
									</Button>
								</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>
									<Button
										variant="ghost"
										onClick={() => onSort("createdAt")}
										className="h-auto p-0 font-semibold"
									>
										Created
										{getSortIcon("createdAt")}
									</Button>
								</TableHead>
								<TableHead className="w-[50px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{bookings.map((booking) => (
								<TableRow key={booking.id}>
									<TableCell>
										<div className="flex items-center space-x-3">
											<Avatar className="h-10 w-10">
												<AvatarImage
													src={booking.provider.image}
													alt={booking.provider.name}
												/>
												<AvatarFallback>
													{booking.provider.name.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="min-w-0 flex-1">
												<p className="font-medium text-sm truncate">
													{booking.service.name}
												</p>
												<p className="text-xs text-muted-foreground truncate">
													by {booking.provider.name}
												</p>
												<Badge variant="outline" className="text-xs mt-1">
													{booking.service.category.name}
												</Badge>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className="text-sm">
											<p className="font-medium">
												{format(new Date(booking.scheduledFor), "MMM dd, yyyy")}
											</p>
											<p className="text-muted-foreground">
												{format(new Date(booking.scheduledFor), "hh:mm a")}
											</p>
										</div>
									</TableCell>
									<TableCell>
										<BookingStatusBadge status={booking.status} />
									</TableCell>
									<TableCell>
										<div className="font-medium">
											₦{booking.service.price.toLocaleString()}
										</div>
										{booking.payment && (
											<div className="text-xs text-muted-foreground">
												{booking.payment.paymentMethod}
											</div>
										)}
									</TableCell>
									<TableCell>
										<div className="text-sm text-muted-foreground">
											{format(new Date(booking.createdAt || ""), "MMM dd")}
										</div>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<MoreHorizontal className="h-4 w-4" />
													<span className="sr-only">Open menu</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => onViewDetails(booking.id)}
												>
													<Eye className="mr-2 h-4 w-4" />
													View Details
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/app/bookings/${booking.id}/chat`}>
														<MessageCircle className="mr-2 h-4 w-4" />
														Open Chat
													</Link>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			</div>

			{/* Mobile Card View */}
			<div className="md:hidden space-y-4">
				{bookings.map((booking) => (
					<Card key={booking.id} className="p-4">
						<div className="flex items-start justify-between mb-3">
							<div className="flex items-center space-x-3 flex-1 min-w-0">
								<Avatar className="h-10 w-10 flex-shrink-0">
									<AvatarImage
										src={booking.provider.image}
										alt={booking.provider.name}
									/>
									<AvatarFallback>
										{booking.provider.name.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<h3 className="font-medium text-sm truncate">
										{booking.service.name}
									</h3>
									<p className="text-xs text-muted-foreground truncate">
										by {booking.provider.name}
									</p>
								</div>
							</div>
							<BookingStatusBadge status={booking.status} />
						</div>

						<div className="grid grid-cols-2 gap-3 text-sm">
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span>{format(new Date(booking.scheduledFor), "MMM dd, yyyy")}</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<span>{format(new Date(booking.scheduledFor), "hh:mm a")}</span>
							</div>
							<div className="flex items-center gap-2">
								<DollarSign className="h-4 w-4 text-muted-foreground" />
								<span>₦{booking.service.price.toLocaleString()}</span>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="text-xs">
									{booking.service.category.name}
								</Badge>
							</div>
						</div>

						<div className="mt-3 pt-3 border-t flex justify-end space-x-2">
							<Button
								variant="outline"
								size="sm"
								asChild
							>
								<Link href={`/app/bookings/${booking.id}/chat`}>
									<MessageCircle className="mr-2 h-4 w-4" />
									Chat
								</Link>
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onViewDetails(booking.id)}
							>
								<Eye className="mr-2 h-4 w-4" />
								View Details
							</Button>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}

function BookingDataTableSkeleton() {
	return (
		<div className="space-y-4">
			{/* Desktop skeleton */}
			<div className="hidden md:block">
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Service & Provider</TableHead>
								<TableHead>Date & Time</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="w-[50px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<div className="flex items-center space-x-3">
											<Skeleton className="h-10 w-10 rounded-full" />
											<div className="space-y-2">
												<Skeleton className="h-4 w-32" />
												<Skeleton className="h-3 w-24" />
												<Skeleton className="h-5 w-16" />
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className="space-y-1">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-3 w-20" />
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-8 w-8" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			</div>

			{/* Mobile skeleton */}
			<div className="md:hidden space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<Card key={i} className="p-4">
						<div className="flex items-start justify-between mb-3">
							<div className="flex items-center space-x-3 flex-1">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-24" />
								</div>
							</div>
							<Skeleton className="h-6 w-20" />
						</div>
						<div className="grid grid-cols-2 gap-3">
							{Array.from({ length: 4 }).map((_, j) => (
								<Skeleton key={j} className="h-4 w-20" />
							))}
						</div>
						<div className="mt-3 pt-3 border-t flex justify-end">
							<Skeleton className="h-8 w-24" />
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
