"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	studentBookingsApi,
	studentBookingsQueryKeys,
	DetailedStudentBooking,
	BookingFilters,
	Pagination,
} from "@/modules/student/api";
import {
	BookingFilterTabs,
	BookingDataTable,
} from "@/modules/student/components";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@ui/components/card";
import { Button } from "@ui/components/button";
import {
	ChevronLeft,
	ChevronRight,
	Calendar,
	GraduationCap,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentBookingsPage() {
	const [status, setStatus] = useState<BookingFilters["status"]>("all");
	const [sortBy, setSortBy] = useState<BookingFilters["sortBy"]>("dateTime");
	const [sortOrder, setSortOrder] = useState<BookingFilters["sortOrder"]>("desc");
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);
	const router = useRouter();

	const {
		data: bookingsData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: studentBookingsQueryKeys.list({ status, sortBy, sortOrder, page, limit }),
		queryFn: () =>
			studentBookingsApi.getBookings({
				status,
				sortBy,
				sortOrder,
				page,
				limit,
			}),
		keepPreviousData: true,
		onError: () => {
			toast.error("Failed to load bookings. Please try again.");
		},
	});

	const handleStatusChange = (newStatus: BookingFilters["status"]) => {
		setStatus(newStatus);
		setPage(1);
	};

	const handleSort = (column: BookingFilters["sortBy"]) => {
		if (sortBy === column) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(column);
			setSortOrder("asc");
		}
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const handleViewDetails = (bookingId: string) => {
		router.push(`/app/student/bookings/${bookingId}`);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-4">
					<div className="relative">
						<Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
						<div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
					</div>
					<div className="space-y-2">
						<p className="text-lg font-medium">
							Loading your bookings...
						</p>
						<p className="text-sm text-muted-foreground">
							Please wait while we fetch your booking history
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-4 max-w-md">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
						<div className="w-8 h-8 bg-red-500 rounded-full" />
					</div>
					<div className="space-y-2">
						<h2 className="text-xl font-semibold text-red-600">
							Error Loading Bookings
						</h2>
						<p className="text-sm text-muted-foreground">
							We're having trouble loading your booking data.
							Please try refreshing the page or contact support if
							the problem persists.
						</p>
					</div>
					<Button
						onClick={() => window.location.reload()}
						variant="outline"
					>
						Refresh Page
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header Section */}
			<div className="bg-card border-b shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between py-6">
						<div className="flex items-center space-x-4">
							<Button 
								variant="ghost" 
								size="sm" 
								asChild
								className="mr-2"
							>
								<Link href="/app/student">
									<ChevronLeft className="h-4 w-4 mr-1" />
									Back to Dashboard
								</Link>
							</Button>
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
									<Calendar className="h-5 w-5 text-primary-foreground" />
								</div>
								<div>
									<h1 className="text-3xl font-bold tracking-tight text-foreground">
										My Bookings
									</h1>
									<p className="text-sm text-muted-foreground mt-1">
										Review and manage all your service bookings
									</p>
								</div>
							</div>
						</div>
						<div className="flex items-center space-x-3">
							<Button asChild variant="primary">
								<Link href="/app/services">
									<GraduationCap className="h-4 w-4 mr-2" />
									Book New Service
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="space-y-6">
					{/* Filter Tabs */}
					<BookingFilterTabs
						currentStatus={status}
						onStatusChange={handleStatusChange}
						counts={{
							all: bookingsData?.pagination.totalCount || 0,
							upcoming: bookingsData?.bookings.filter((b) =>
								["PENDING", "CONFIRMED"].includes(b.status),
							).length || 0,
							completed: bookingsData?.bookings.filter((b) =>
								b.status === "COMPLETED",
							).length || 0,
							cancelled: bookingsData?.bookings.filter((b) =>
								b.status === "CANCELLED",
							).length || 0,
							pending: bookingsData?.bookings.filter((b) =>
								b.status === "PENDING",
							).length || 0,
							confirmed: bookingsData?.bookings.filter((b) =>
								b.status === "CONFIRMED",
							).length || 0,
						}}
					/>

					{/* Bookings Table */}
					<BookingDataTable
						bookings={bookingsData?.bookings || []}
						isLoading={isLoading}
						sortBy={sortBy}
						sortOrder={sortOrder}
						onSort={handleSort}
						onViewDetails={handleViewDetails}
					/>

					{/* Pagination */}
					{bookingsData?.pagination && bookingsData.pagination.totalPages > 1 && (
						<Card>
							<CardContent className="flex items-center justify-between py-4">
								<Button
									variant="outline"
									size="sm"
									disabled={!bookingsData.pagination.hasPrev}
									onClick={() => handlePageChange(page - 1)}
								>
									<ChevronLeft className="h-4 w-4 mr-1" />
									Previous
								</Button>
								
								<div className="flex items-center space-x-2 text-sm text-muted-foreground">
									<span>
										Page <span className="font-medium text-foreground">{page}</span> of{' '}
										<span className="font-medium text-foreground">{bookingsData.pagination.totalPages}</span>
									</span>
									<span>•</span>
									<span>
										<span className="font-medium text-foreground">{bookingsData.pagination.totalCount}</span> total bookings
									</span>
								</div>

								<Button
									variant="outline"
									size="sm"
									disabled={!bookingsData.pagination.hasNext}
									onClick={() => handlePageChange(page + 1)}
								>
									Next
									<ChevronRight className="h-4 w-4 ml-1" />
								</Button>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
