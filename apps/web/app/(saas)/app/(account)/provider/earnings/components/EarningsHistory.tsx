"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@ui/components/card";
import { Button } from "@ui/components/button";
import { Badge } from "@ui/components/badge";
import { Input } from "@ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@ui/components/table";
import { Skeleton } from "@ui/components/skeleton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ui/components/dialog";
import {
	History,
	Search,
	Filter,
	ChevronLeft,
	ChevronRight,
	MoreHorizontal,
	Calendar,
	User,
	BookOpen,
	DollarSign,
	Eye,
	RefreshCw,
	Download,
} from "lucide-react";
import {
	providerEarningsApi,
	providerEarningsQueryKeys,
	type ProviderEarning,
} from "@/modules/provider/api";

interface EarningsHistoryProps {
	dateRange: { startDate?: string; endDate?: string };
}

export function EarningsHistory({ dateRange }: EarningsHistoryProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedEarning, setSelectedEarning] = useState<ProviderEarning | null>(null);
	const pageSize = 20;

	// Fetch earnings history
	const {
		data: earningsData,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: providerEarningsQueryKeys.earnings({
			page: currentPage,
			limit: pageSize,
			status: statusFilter === "all" ? undefined : statusFilter,
			...dateRange,
		}),
		queryFn: () =>
			providerEarningsApi.getEarnings({
				page: currentPage,
				limit: pageSize,
				status: statusFilter === "all" ? undefined : statusFilter,
				...dateRange,
			}),
		staleTime: 2 * 60 * 1000,
	});

	// Format currency
	const formatCurrency = (amount: number | undefined | null) => {
		if (amount === undefined || amount === null || isNaN(amount)) {
			return '₦0';
		}
		return `₦${amount.toLocaleString()}`;
	};

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Get status badge variant
	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "PENDING":
				return "secondary";
			case "CLEARED":
				return "default";
			case "FAILED":
				return "destructive";
			default:
				return "outline";
		}
	};

	// Get status color
	const getStatusColor = (status: string) => {
		switch (status) {
			case "PENDING":
				return "text-yellow-600";
			case "CLEARED":
				return "text-green-600";
			case "FAILED":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	// Handle search
	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1);
	};

	// Handle status filter
	const handleStatusFilter = (value: string) => {
		setStatusFilter(value);
		setCurrentPage(1);
	};

	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	// Export earnings (placeholder)
	const handleExport = () => {
		// Implementation for exporting earnings data
		console.log("Exporting earnings data...");
	};

	const totalPages = Math.ceil((earningsData?.meta?.pagination?.total || 0) / pageSize);
	const earnings = earningsData?.data || [];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<History className="h-5 w-5" />
							Earnings History
						</CardTitle>
						<CardDescription>
							Detailed record of all your earnings and transactions
						</CardDescription>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => refetch()}
							disabled={isLoading}
						>
							<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
						</Button>
						<Button variant="outline" size="sm" onClick={handleExport}>
							<Download className="h-4 w-4" />
							Export
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{/* Filters and Search */}
				<div className="flex flex-col sm:flex-row gap-4 mb-6">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by student name, service, or booking..."
							value={searchTerm}
							onChange={(e) => handleSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Select value={statusFilter} onValueChange={handleStatusFilter}>
						<SelectTrigger className="w-full sm:w-[180px]">
							<Filter className="h-4 w-4 mr-2" />
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="PENDING">Pending</SelectItem>
							<SelectItem value="CLEARED">Cleared</SelectItem>
							<SelectItem value="FAILED">Failed</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Earnings Table */}
				{isLoading ? (
					<EarningsHistorySkeleton />
				) : isError ? (
					<div className="text-center py-12">
						<div className="text-red-500 mb-2">Failed to load earnings history</div>
						<Button variant="outline" onClick={() => refetch()}>
							Try Again
						</Button>
					</div>
				) : earnings.length === 0 ? (
					<div className="text-center py-12">
						<History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
						<h3 className="text-lg font-medium mb-2">No Earnings Found</h3>
						<p className="text-muted-foreground">
							{searchTerm || statusFilter !== "all"
								? "No earnings match your current filters"
								: "Complete your first booking to see earnings here"}
						</p>
						{(searchTerm || statusFilter !== "all") && (
							<Button
								variant="outline"
								onClick={() => {
									setSearchTerm("");
									setStatusFilter("all");
									setCurrentPage(1);
								}}
								className="mt-4"
							>
								Clear Filters
							</Button>
						)}
					</div>
				) : (
					<>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Service</TableHead>
										<TableHead>Student</TableHead>
										<TableHead>Booking</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Fee</TableHead>
										<TableHead>Net</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="w-[50px]"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{earnings.map((earning) => (
										<TableRow key={earning.id}>
											<TableCell className="font-medium">
												<div className="flex items-center gap-2">
													<Calendar className="h-4 w-4 text-muted-foreground" />
													<span className="text-sm">
														{formatDate(earning.createdAt)}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<BookOpen className="h-4 w-4 text-muted-foreground" />
													<span className="font-medium text-sm">
														{earning.booking.service.name}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<User className="h-4 w-4 text-muted-foreground" />
													<span className="text-sm">{earning.booking.student.name}</span>
												</div>
											</TableCell>
											<TableCell>
												<code className="text-xs bg-muted px-2 py-1 rounded">
													{earning.booking.id.slice(-8)}
												</code>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<DollarSign className="h-3 w-3 text-muted-foreground" />
													<span className="font-medium">
														{formatCurrency(earning.grossAmount)}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<span className="text-red-600 text-sm">
													-{formatCurrency(earning.platformFee)}
												</span>
											</TableCell>
											<TableCell>
												<span className="font-semibold text-green-600">
													{formatCurrency(earning.netAmount)}
												</span>
											</TableCell>
											<TableCell>
												<Badge
													variant={getStatusBadgeVariant(earning.status)}
													className={getStatusColor(earning.status)}
												>
													{earning.status}
												</Badge>
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" className="h-8 w-8 p-0">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem
															onClick={() => setSelectedEarning(earning)}
														>
															<Eye className="h-4 w-4 mr-2" />
															View Details
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => {
																navigator.clipboard.writeText(earning.booking.id);
															}}
														>
															Copy Booking ID
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex items-center justify-between mt-6">
								<div className="text-sm text-muted-foreground">
									Showing {(currentPage - 1) * pageSize + 1} to{" "}
									{Math.min(currentPage * pageSize, earningsData?.meta?.pagination?.total || 0)} of{" "}
									{earningsData?.meta?.pagination?.total || 0} earnings
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage === 1}
									>
										<ChevronLeft className="h-4 w-4" />
										Previous
									</Button>
									<div className="flex items-center gap-1">
										{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
											let pageNum;
											if (totalPages <= 5) {
												pageNum = i + 1;
											} else if (currentPage <= 3) {
												pageNum = i + 1;
											} else if (currentPage >= totalPages - 2) {
												pageNum = totalPages - 4 + i;
											} else {
												pageNum = currentPage - 2 + i;
											}
											return (
												<Button
													key={pageNum}
													variant={currentPage === pageNum ? "default" : "outline"}
													size="sm"
													onClick={() => handlePageChange(pageNum)}
													className="w-8 h-8 p-0"
												>
													{pageNum}
												</Button>
											);
										})}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={currentPage === totalPages}
									>
										Next
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)}
					</>
				)}

				{/* Earning Details Modal */}
				{selectedEarning && (
					<Dialog
						open={!!selectedEarning}
						onOpenChange={(open) => !open && setSelectedEarning(null)}
					>
						<DialogContent className="sm:max-w-[500px]">
							<DialogHeader>
								<DialogTitle>Earning Details</DialogTitle>
								<DialogDescription>
									Detailed information about this earning record
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Service
										</label>
										<p className="text-sm font-medium">
											{selectedEarning.booking.service.name}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Student
										</label>
										<p className="text-sm font-medium">
											{selectedEarning.booking.student.name}
										</p>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Booking ID
										</label>
										<code className="text-xs bg-muted px-2 py-1 rounded block">
											{selectedEarning.booking.id}
										</code>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Date
										</label>
										<p className="text-sm">{formatDate(selectedEarning.createdAt)}</p>
									</div>
								</div>
								<div className="space-y-2 pt-4 border-t">
									<div className="flex justify-between">
										<span className="text-sm">Gross Amount:</span>
										<span className="text-sm font-medium">
											{formatCurrency(selectedEarning.grossAmount)}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm">Platform Fee:</span>
										<span className="text-sm text-red-600">
											-{formatCurrency(selectedEarning.platformFee)}
										</span>
									</div>
									<div className="flex justify-between font-semibold border-t pt-2">
										<span>Net Amount:</span>
										<span className="text-green-600">
											{formatCurrency(selectedEarning.netAmount)}
										</span>
									</div>
								</div>
								<div className="pt-4 border-t">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Status:</span>
										<Badge
											variant={getStatusBadgeVariant(selectedEarning.status)}
											className={getStatusColor(selectedEarning.status)}
										>
											{selectedEarning.status}
										</Badge>
									</div>
									{selectedEarning.clearedAt && (
										<div className="flex justify-between mt-2">
											<span className="text-sm text-muted-foreground">
												Cleared At:
											</span>
											<span className="text-sm">
												{formatDate(selectedEarning.clearedAt)}
											</span>
										</div>
									)}
								</div>
							</div>
						</DialogContent>
					</Dialog>
				)}
			</CardContent>
		</Card>
	);
}

function EarningsHistorySkeleton() {
	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Service</TableHead>
							<TableHead>Student</TableHead>
							<TableHead>Booking</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Fee</TableHead>
							<TableHead>Net</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="w-[50px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{[...Array(10)].map((_, i) => (
							<TableRow key={i}>
								<TableCell>
									<Skeleton className="h-4 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-16" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-16" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-16" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-8 w-8" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
