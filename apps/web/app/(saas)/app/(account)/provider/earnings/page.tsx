"use client";

import React, { useState, Suspense } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { Skeleton } from "@ui/components/skeleton";
import {
	DollarSign,
	TrendingUp,
	CreditCard,
	BarChart3,
	Wallet,
	Clock,
	Filter,
	Download,
	ArrowUpRight,
	ArrowDownRight,
	Loader2,
} from "lucide-react";
import {
	providerEarningsApi,
	providerEarningsQueryKeys,
} from "@/modules/provider/api";

// Import our custom components (we'll create these next)
import { EarningsOverview } from "./components/EarningsOverview";
import { EarningsHistory } from "./components/EarningsHistory";
import { EarningsAnalytics } from "./components/EarningsAnalytics";
import { PayoutManagement } from "./components/PayoutManagement";

interface EarningsPageProps {}

export default function EarningsPage({}: EarningsPageProps) {
	const [activeTab, setActiveTab] = useState("overview");
	const [dateRange, setDateRange] = useState<{
		startDate?: string;
		endDate?: string;
	}>({});

	// Fetch enhanced dashboard summary with earnings data
	const {
		data: earningsSummary,
		isLoading: isSummaryLoading,
		error: summaryError,
	} = useQuery({
		queryKey: providerEarningsQueryKeys.summary(dateRange),
		queryFn: () => providerEarningsApi.getEarningsSummary(dateRange),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	if (summaryError) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-4 max-w-md">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
						<div className="w-8 h-8 bg-red-500 rounded-full" />
					</div>
					<div className="space-y-2">
						<h2 className="text-xl font-semibold text-red-600">
							Error Loading Earnings Data
						</h2>
						<p className="text-sm text-muted-foreground">
							We're having trouble loading your earnings data.
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
			{/* Enhanced Header Section */}
			<div className="bg-card border-b shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between py-6">
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
									<DollarSign className="h-5 w-5 text-primary-foreground" />
								</div>
								<div>
									<h1 className="text-3xl font-bold tracking-tight text-foreground">
										Earnings & Growth Hub
									</h1>
									<p className="text-sm text-muted-foreground mt-1">
										Track your earnings, analytics, and manage payouts
									</p>
								</div>
							</div>
						</div>
						<div className="flex items-center space-x-3">
							<Badge variant="secondary" className="text-xs">
								<Clock className="h-3 w-3 mr-1" />
								Live Data
							</Badge>
							<Button variant="outline" size="sm">
								<Download className="h-4 w-4 mr-2" />
								Export Report
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="space-y-8">
					{/* Quick Stats Cards */}
					{isSummaryLoading ? (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
							{[...Array(4)].map((_, i) => (
								<Card key={i}>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-8 w-8 rounded" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-8 w-16 mb-2" />
										<Skeleton className="h-3 w-24" />
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
							{/* Available Balance */}
							<Card className="group hover:shadow-xl hover:shadow-green-500/20 transition-all duration-500 border-0 bg-card/70 backdrop-blur-lg hover:bg-card/80">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium text-foreground group-hover:text-green-600 transition-colors duration-300">
										Available Balance
									</CardTitle>
									<div className="p-2 bg-green-500 rounded-lg group-hover:bg-green-500/80 transition-all duration-300">
										<Wallet className="h-4 w-4 text-white" />
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold text-foreground group-hover:text-green-600 transition-all duration-300">
										₦{earningsSummary?.earnings.availableBalance.toLocaleString() || 0}
									</div>
									<div className="flex items-center mt-2">
										<ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
										<p className="text-xs text-green-500 font-medium">
											Ready for payout
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Total Lifetime Earnings */}
							<Card className="group hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-500 border-0 bg-card/70 backdrop-blur-lg hover:bg-card/80">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium text-foreground group-hover:text-blue-600 transition-colors duration-300">
										Total Earnings
									</CardTitle>
									<div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-500/80 transition-all duration-300">
										<TrendingUp className="h-4 w-4 text-white" />
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold text-foreground group-hover:text-blue-600 transition-all duration-300">
										₦{earningsSummary?.earnings.totalLifetime.toLocaleString() || 0}
									</div>
									<div className="flex items-center mt-2">
										<TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
										<p className="text-xs text-blue-500 font-medium">
											All time earnings
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Pending Clearance */}
							<Card className="group hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-500 border-0 bg-card/70 backdrop-blur-lg hover:bg-card/80">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium text-foreground group-hover:text-orange-600 transition-colors duration-300">
										Pending Clearance
									</CardTitle>
									<div className="p-2 bg-orange-500 rounded-lg group-hover:bg-orange-500/80 transition-all duration-300">
										<Clock className="h-4 w-4 text-white" />
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold text-foreground group-hover:text-orange-600 transition-all duration-300">
										₦{earningsSummary?.earnings.pendingClearance.toLocaleString() || 0}
									</div>
									<div className="flex items-center mt-2">
										<Clock className="h-3 w-3 text-orange-500 mr-1" />
										<p className="text-xs text-orange-500 font-medium">
											Being processed
										</p>
									</div>
								</CardContent>
							</Card>

							{/* This Month */}
							<Card className="group hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-500 border-0 bg-card/70 backdrop-blur-lg hover:bg-card/80">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium text-foreground group-hover:text-purple-600 transition-colors duration-300">
										This Month
									</CardTitle>
									<div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-500/80 transition-all duration-300">
										<BarChart3 className="h-4 w-4 text-white" />
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold text-foreground group-hover:text-purple-600 transition-all duration-300">
										₦{earningsSummary?.earnings.thisMonth.toLocaleString() || 0}
									</div>
									<div className="flex items-center mt-2">
										{earningsSummary?.earnings.thisMonth >= earningsSummary?.earnings.lastMonth ? (
											<ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
										) : (
											<ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
										)}
										<p className="text-xs text-muted-foreground font-medium">
											vs last month
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Main Tabbed Interface */}
					<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
						<TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
							<TabsTrigger value="overview" className="flex items-center gap-2">
								<BarChart3 className="h-4 w-4" />
								<span className="hidden sm:inline">Overview</span>
							</TabsTrigger>
							<TabsTrigger value="earnings" className="flex items-center gap-2">
								<DollarSign className="h-4 w-4" />
								<span className="hidden sm:inline">Earnings</span>
							</TabsTrigger>
							<TabsTrigger value="analytics" className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4" />
								<span className="hidden sm:inline">Analytics</span>
							</TabsTrigger>
							<TabsTrigger value="payouts" className="flex items-center gap-2">
								<CreditCard className="h-4 w-4" />
								<span className="hidden sm:inline">Payouts</span>
							</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="space-y-6">
							<Suspense fallback={<EarningsOverviewSkeleton />}>
								<EarningsOverview 
									summary={earningsSummary}
									isLoading={isSummaryLoading}
									dateRange={dateRange}
									onDateRangeChange={setDateRange}
								/>
							</Suspense>
						</TabsContent>

							<TabsContent value="earnings" className="space-y-6">
								<Suspense fallback={<EarningsHistorySkeleton />}>
									<EarningsHistory dateRange={dateRange} />
								</Suspense>
							</TabsContent>

						<TabsContent value="analytics" className="space-y-6">
							<Suspense fallback={<EarningsAnalyticsSkeleton />}>
								<EarningsAnalytics dateRange={dateRange} />
							</Suspense>
						</TabsContent>

							<TabsContent value="payouts" className="space-y-6">
								<Suspense fallback={<PayoutManagementSkeleton />}>
									<PayoutManagement 
										summary={earningsSummary}
										isLoadingSummary={isSummaryLoading}
									/>
								</Suspense>
							</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}

// Skeleton components for loading states
function EarningsOverviewSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-6 md:grid-cols-2">
				{[...Array(2)].map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-64 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

function EarningsHistorySkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-4 w-64" />
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="flex items-center justify-between p-4 border rounded-lg">
							<div className="space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-48" />
							</div>
							<Skeleton className="h-6 w-20" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function EarningsAnalyticsSkeleton() {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			{[...Array(3)].map((_, i) => (
				<Card key={i}>
					<CardHeader>
						<Skeleton className="h-6 w-40" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-48 w-full" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function PayoutManagementSkeleton() {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-32" />
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-40" />
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="flex justify-between items-center p-3 border rounded">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-16" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
