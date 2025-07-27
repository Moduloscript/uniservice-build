"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Label } from "@ui/components/label";
import { Textarea } from "@ui/components/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ui/components/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@ui/components/table";
import { Skeleton } from "@ui/components/skeleton";
import { Alert, AlertDescription } from "@ui/components/alert";
import {
	Banknote,
	Plus,
	Clock,
	CheckCircle,
	XCircle,
	ArrowUpCircle,
	AlertTriangle,
	CreditCard,
	Building,
	DollarSign,
	Calendar,
	RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
	providerEarningsApi,
	providerEarningsQueryKeys,
	type ProviderEarningsSummary,
	type PayoutRequest,
	type PayoutRequestRecord,
} from "@/modules/provider/api";

interface PayoutManagementProps {
	summary?: ProviderEarningsSummary;
	isLoadingSummary: boolean;
}

export function PayoutManagement({ summary, isLoadingSummary }: PayoutManagementProps) {
	const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
	const [requestAmount, setRequestAmount] = useState("");
	const [payoutMethod, setPayoutMethod] = useState("");
	const [accountDetails, setAccountDetails] = useState("");
	const [notes, setNotes] = useState("");

	const queryClient = useQueryClient();

	// Fetch payout requests
	const {
		data: payoutRequests,
		isLoading: isLoadingRequests,
		refetch: refetchRequests,
	} = useQuery({
		queryKey: providerEarningsQueryKeys.payouts({ limit: 10 }),
		queryFn: () => providerEarningsApi.getPayoutRequests({ limit: 10 }),
		staleTime: 2 * 60 * 1000,
	});

	// Request payout mutation
	const requestPayoutMutation = useMutation({
		mutationFn: (data: {
			amount: number;
			method: string;
			accountDetails: string;
			notes?: string;
		}) => providerEarningsApi.requestPayout(data),
		onSuccess: () => {
			toast.success("Payout request submitted successfully!");
			setIsRequestModalOpen(false);
			resetForm();
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: providerEarningsQueryKeys.payouts({}),
			});
			queryClient.invalidateQueries({
				queryKey: providerEarningsQueryKeys.summary({}),
			});
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to submit payout request");
		},
	});

	// Format currency
	const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Get status badge variant
	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "PENDING":
				return "secondary";
			case "APPROVED":
				return "default";
			case "PROCESSING":
				return "outline";
			case "COMPLETED":
				return "default";
			case "REJECTED":
				return "destructive";
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
			case "APPROVED":
				return "text-blue-600";
			case "PROCESSING":
				return "text-purple-600";
			case "COMPLETED":
				return "text-green-600";
			case "REJECTED":
				return "text-red-600";
			case "FAILED":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	// Get status icon
	const getStatusIcon = (status: string) => {
		switch (status) {
			case "PENDING":
				return <Clock className="h-4 w-4" />;
			case "APPROVED":
				return <CheckCircle className="h-4 w-4" />;
			case "PROCESSING":
				return <ArrowUpCircle className="h-4 w-4" />;
			case "COMPLETED":
				return <CheckCircle className="h-4 w-4" />;
			case "REJECTED":
				return <XCircle className="h-4 w-4" />;
			case "FAILED":
				return <XCircle className="h-4 w-4" />;
			default:
				return <Clock className="h-4 w-4" />;
		}
	};

	// Reset form
	const resetForm = () => {
		setRequestAmount("");
		setPayoutMethod("");
		setAccountDetails("");
		setNotes("");
	};

	// Handle payout request
	const handlePayoutRequest = () => {
		const amount = parseFloat(requestAmount);
		if (!amount || amount <= 0) {
			toast.error("Please enter a valid amount");
			return;
		}
		if (!payoutMethod) {
			toast.error("Please select a payout method");
			return;
		}
		if (!accountDetails.trim()) {
			toast.error("Please provide account details");
			return;
		}

		if (amount > (summary?.earnings.availableBalance || 0)) {
			toast.error("Amount exceeds available balance");
			return;
		}

		requestPayoutMutation.mutate({
			amount,
			method: payoutMethod,
			accountDetails: accountDetails.trim(),
			notes: notes.trim() || undefined,
		});
	};

	// Calculate minimum payout amount
	const minimumPayout = 1000; // ₦1,000 minimum
	const availableBalance = summary?.earnings.availableBalance || 0;
	const canRequestPayout = availableBalance >= minimumPayout;

	return (
		<div className="space-y-6">
			{/* Payout Summary Card */}
			<Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Banknote className="h-5 w-5" />
						Available for Payout
					</CardTitle>
					<CardDescription>
						Your current available balance ready for withdrawal
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoadingSummary ? (
						<div className="space-y-3">
							<Skeleton className="h-8 w-32" />
							<Skeleton className="h-4 w-48" />
						</div>
					) : (
						<div className="space-y-3">
							<div className="text-3xl font-bold text-green-600">
								{formatCurrency(availableBalance)}
							</div>
							<div className="flex items-center gap-4">
								<div className="text-sm text-muted-foreground">
									Minimum payout: {formatCurrency(minimumPayout)}
								</div>
								<Dialog
									open={isRequestModalOpen}
									onOpenChange={setIsRequestModalOpen}
								>
									<DialogTrigger asChild>
										<Button
											disabled={!canRequestPayout || requestPayoutMutation.isPending}
											className="gap-2"
										>
											<Plus className="h-4 w-4" />
											Request Payout
										</Button>
									</DialogTrigger>
									<DialogContent className="sm:max-w-[500px]">
										<DialogHeader>
											<DialogTitle>Request Payout</DialogTitle>
											<DialogDescription>
												Submit a request to withdraw your available earnings.
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4">
											<div className="space-y-2">
												<Label htmlFor="amount">Amount</Label>
												<div className="relative">
													<DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
													<Input
														id="amount"
														type="number"
														placeholder="0.00"
														value={requestAmount}
														onChange={(e) => setRequestAmount(e.target.value)}
														className="pl-10"
														min={minimumPayout}
														max={availableBalance}
													/>
												</div>
												<div className="text-xs text-muted-foreground">
													Available: {formatCurrency(availableBalance)}
												</div>
											</div>

											<div className="space-y-2">
												<Label htmlFor="method">Payout Method</Label>
												<Select value={payoutMethod} onValueChange={setPayoutMethod}>
													<SelectTrigger>
														<SelectValue placeholder="Select payout method" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="bank_transfer">
															<div className="flex items-center gap-2">
																<Building className="h-4 w-4" />
																Bank Transfer
															</div>
														</SelectItem>
														<SelectItem value="mobile_money">
															<div className="flex items-center gap-2">
																<CreditCard className="h-4 w-4" />
																Mobile Money
															</div>
														</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div className="space-y-2">
												<Label htmlFor="details">Account Details</Label>
												<Textarea
													id="details"
													placeholder={
														payoutMethod === "bank_transfer"
															? "Bank name, account number, account name"
															: payoutMethod === "mobile_money"
															? "Mobile money provider, phone number, account name"
															: "Provide your account details"
													}
													value={accountDetails}
													onChange={(e) => setAccountDetails(e.target.value)}
													rows={3}
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="notes">Notes (Optional)</Label>
												<Textarea
													id="notes"
													placeholder="Any additional information..."
													value={notes}
													onChange={(e) => setNotes(e.target.value)}
													rows={2}
												/>
											</div>

											{parseFloat(requestAmount) > availableBalance && (
												<Alert>
													<AlertTriangle className="h-4 w-4" />
													<AlertDescription>
														Amount exceeds your available balance of{" "}
														{formatCurrency(availableBalance)}.
													</AlertDescription>
												</Alert>
											)}
										</div>
										<DialogFooter>
											<Button
												variant="outline"
												onClick={() => {
													setIsRequestModalOpen(false);
													resetForm();
												}}
											>
												Cancel
											</Button>
											<Button
												onClick={handlePayoutRequest}
												disabled={
													!requestAmount ||
													!payoutMethod ||
													!accountDetails.trim() ||
													parseFloat(requestAmount) > availableBalance ||
													requestPayoutMutation.isPending
												}
											>
												{requestPayoutMutation.isPending
													? "Submitting..."
													: "Submit Request"}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>

							{!canRequestPayout && (
								<Alert>
									<AlertTriangle className="h-4 w-4" />
									<AlertDescription>
										You need at least {formatCurrency(minimumPayout)} to request a
										payout. Complete more bookings to reach the minimum threshold.
									</AlertDescription>
								</Alert>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Payout Requests History */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Clock className="h-5 w-5" />
								Payout Requests
							</CardTitle>
							<CardDescription>
								History of your payout requests and their status
							</CardDescription>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => refetchRequests()}
							disabled={isLoadingRequests}
						>
							<RefreshCw
								className={`h-4 w-4 ${isLoadingRequests ? "animate-spin" : ""}`}
							/>
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{isLoadingRequests ? (
						<div className="space-y-4">
							{[...Array(3)].map((_, i) => (
								<div key={i} className="flex items-center justify-between p-4 border rounded-lg">
									<div className="space-y-2 flex-1">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-3 w-32" />
									</div>
									<div className="space-y-2">
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-5 w-16" />
									</div>
								</div>
							))}
						</div>
					) : !payoutRequests?.requests?.length ? (
						<div className="text-center py-12">
							<Banknote className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
							<h3 className="text-lg font-medium mb-2">No Payout Requests</h3>
							<p className="text-muted-foreground">
								You haven't made any payout requests yet.
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{payoutRequests.requests.map((request) => (
								<div
									key={request.id}
									className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
								>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											{getStatusIcon(request.status)}
											<span className="font-medium">
												{formatCurrency(request.amount)}
											</span>
											<Badge
												variant={getStatusBadgeVariant(request.status)}
												className={getStatusColor(request.status)}
											>
												{request.status}
											</Badge>
										</div>
										<div className="flex items-center gap-4 text-sm text-muted-foreground">
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{formatDate(request.createdAt)}
											</div>
											<div className="flex items-center gap-1">
												{request.method === "bank_transfer" ? (
													<Building className="h-3 w-3" />
												) : (
													<CreditCard className="h-3 w-3" />
												)}
												{request.method === "bank_transfer"
													? "Bank Transfer"
													: "Mobile Money"}
											</div>
										</div>
										{request.notes && (
											<p className="text-sm text-muted-foreground">
												{request.notes}
											</p>
										)}
									</div>
									<div className="text-right">
										{request.processedAt && (
											<div className="text-xs text-muted-foreground">
												Processed: {formatDate(request.processedAt)}
											</div>
										)}
										{request.status === "REJECTED" && request.rejectionReason && (
											<div className="text-xs text-red-600 max-w-xs">
												{request.rejectionReason}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Payout Information */}
			<Card className="border-0 bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-blue-950/20 dark:via-slate-900 dark:to-indigo-950/20">
				<CardHeader>
					<CardTitle className="text-base">Payout Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3 text-sm">
						<div className="flex items-start gap-3">
							<div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
							<div>
								<p className="font-medium">Processing Time</p>
								<p className="text-muted-foreground">
									Bank transfers: 1-3 business days • Mobile money: Same day
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
							<div>
								<p className="font-medium">Minimum Payout</p>
								<p className="text-muted-foreground">
									{formatCurrency(minimumPayout)} minimum withdrawal amount
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
							<div>
								<p className="font-medium">Fees</p>
								<p className="text-muted-foreground">
									No fees for bank transfers • Mobile money fees may apply
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
							<div>
								<p className="font-medium">Security</p>
								<p className="text-muted-foreground">
									All payouts are reviewed for security and compliance
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
