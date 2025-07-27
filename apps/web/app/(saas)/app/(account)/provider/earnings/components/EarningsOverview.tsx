"use client";

import React from "react";
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
import { Skeleton } from "@ui/components/skeleton";
import {
	LineChart,
	Line,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
} from "recharts";
import {
	TrendingUp,
	TrendingDown,
	Calendar,
	DollarSign,
	Users,
	Target,
	ArrowUpRight,
	ArrowDownRight,
	Info,
} from "lucide-react";
import {
	providerEarningsApi,
	providerEarningsQueryKeys,
	type ProviderEarningsSummary,
} from "@/modules/provider/api";

interface EarningsOverviewProps {
	summary?: ProviderEarningsSummary;
	isLoading: boolean;
	dateRange: { startDate?: string; endDate?: string };
	onDateRangeChange: (range: { startDate?: string; endDate?: string }) => void;
}

export function EarningsOverview({
	summary,
	isLoading,
	dateRange,
	onDateRangeChange,
}: EarningsOverviewProps) {
	// Fetch analytics data for charts
	const { data: earningsOverTime, isLoading: isEarningsOverTimeLoading } = useQuery({
		queryKey: providerEarningsQueryKeys.analytics({
			report: "earnings_over_time",
			period: "month",
			...dateRange,
		}),
		queryFn: () =>
			providerEarningsApi.getAnalytics({
				report: "earnings_over_time",
				period: "month",
				...dateRange,
			}),
		staleTime: 5 * 60 * 1000,
	});

	const { data: earningsByService, isLoading: isEarningsByServiceLoading } = useQuery({
		queryKey: providerEarningsQueryKeys.analytics({
			report: "earnings_by_service",
			...dateRange,
		}),
		queryFn: () =>
			providerEarningsApi.getAnalytics({
				report: "earnings_by_service",
				...dateRange,
			}),
		staleTime: 5 * 60 * 1000,
	});

	// Generate quick date range options
	const quickDateRanges = [
		{
			label: "Last 7 days",
			startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
			endDate: new Date().toISOString().split('T')[0],
		},
		{
			label: "Last 30 days",
			startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
			endDate: new Date().toISOString().split('T')[0],
		},
		{
			label: "This month",
			startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
			endDate: new Date().toISOString().split('T')[0],
		},
		{
			label: "All time",
			startDate: undefined,
			endDate: undefined,
		},
	];

	// Calculate growth rates
	const earningsGrowthRate = summary ? 
		((summary.earnings.thisMonth - summary.earnings.lastMonth) / Math.max(summary.earnings.lastMonth, 1)) * 100 : 0;

	// Format currency
	const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

	// Colors for charts
	const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000'];

	if (isLoading) {
		return <EarningsOverviewSkeleton />;
	}

	return (
		<div className="space-y-6">
			{/* Quick Date Range Selector */}
			<div className="flex flex-wrap gap-2">
				{quickDateRanges.map((range) => (
					<Button
						key={range.label}
						variant={
							dateRange.startDate === range.startDate && dateRange.endDate === range.endDate
								? "default"
								: "outline"
						}
						size="sm"
						onClick={() =>
							onDateRangeChange({
								startDate: range.startDate,
								endDate: range.endDate,
							})
						}
					>
						{range.label}
					</Button>
				))}
			</div>

			{/* Performance Insights Cards */}
			<div className="grid gap-6 md:grid-cols-3">
				{/* Monthly Growth */}
				<Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
						{earningsGrowthRate >= 0 ? (
							<TrendingUp className="h-4 w-4 text-green-600" />
						) : (
							<TrendingDown className="h-4 w-4 text-red-600" />
						)}
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{earningsGrowthRate >= 0 ? '+' : ''}{earningsGrowthRate.toFixed(1)}%
						</div>
						<div className="flex items-center text-xs text-muted-foreground">
							{earningsGrowthRate >= 0 ? (
								<ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
							) : (
								<ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
							)}
							vs last month
						</div>
					</CardContent>
				</Card>

				{/* Average Rating */}
				<Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average Rating</CardTitle>
						<Target className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{summary?.performance.averageRating.toFixed(1) || '0.0'}
						</div>
						<div className="flex items-center text-xs text-muted-foreground">
							<Users className="h-3 w-3 mr-1" />
							{summary?.performance.totalBookings || 0} total bookings
						</div>
					</CardContent>
				</Card>

				{/* Completion Rate */}
				<Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
						<Calendar className="h-4 w-4 text-purple-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{summary && summary.performance.totalBookings > 0
								? ((summary.performance.completedBookings / summary.performance.totalBookings) * 100).toFixed(1)
								: '0.0'}%
						</div>
						<div className="flex items-center text-xs text-muted-foreground">
							<DollarSign className="h-3 w-3 mr-1" />
							{summary?.performance.completedBookings || 0} completed
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Charts Section */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Earnings Over Time Chart */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							Earnings Trend
						</CardTitle>
						<CardDescription>
							Your earnings performance over time
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isEarningsOverTimeLoading ? (
							<Skeleton className="h-64 w-full" />
						) : earningsOverTime?.data?.length ? (
							<ResponsiveContainer width="100%" height={250}>
								<AreaChart data={earningsOverTime.data}>
									<defs>
										<linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
									<XAxis 
										dataKey="date" 
										fontSize={11}
										tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
									/>
									<YAxis 
										fontSize={11}
										tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
									/>
									<Tooltip
										formatter={(value: number) => [formatCurrency(value), 'Earnings']}
										labelFormatter={(label) => new Date(label).toLocaleDateString()}
										contentStyle={{
											backgroundColor: 'var(--card)',
											border: '1px solid var(--border)',
											borderRadius: '8px',
										}}
									/>
									<Area
										type="monotone"
										dataKey="value"
										stroke="#8884d8"
										fillOpacity={1}
										fill="url(#earningsGradient)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<div className="flex items-center justify-center h-64 text-muted-foreground">
								<div className="text-center">
									<TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p className="text-sm">No earnings data available</p>
									<p className="text-xs">Complete more bookings to see your trend</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Earnings by Service */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Target className="h-5 w-5" />
							Top Performing Services
						</CardTitle>
						<CardDescription>
							Which services generate the most revenue
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isEarningsByServiceLoading ? (
							<Skeleton className="h-64 w-full" />
						) : earningsByService?.data?.length ? (
							<ResponsiveContainer width="100%" height={250}>
								<BarChart data={earningsByService.data.slice(0, 5)}>
									<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
									<XAxis 
										dataKey="serviceName" 
										fontSize={11}
										angle={-45}
										textAnchor="end"
										height={60}
									/>
									<YAxis 
										fontSize={11}
										tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
									/>
									<Tooltip
										formatter={(value: number) => [formatCurrency(value), 'Total Earnings']}
										contentStyle={{
											backgroundColor: 'var(--card)',
											border: '1px solid var(--border)',
											borderRadius: '8px',
										}}
									/>
									<Bar 
										dataKey="totalEarnings" 
										fill="#82ca9d"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						) : (
							<div className="flex items-center justify-center h-64 text-muted-foreground">
								<div className="text-center">
									<Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p className="text-sm">No service data available</p>
									<p className="text-xs">Create services to see performance breakdown</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Key Insights */}
			<Card className="border-0 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-cyan-950/20">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="h-5 w-5" />
						Key Insights
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
								<div>
									<p className="text-sm font-medium">Payout Status</p>
									<p className="text-xs text-muted-foreground">
										You have {formatCurrency(summary?.earnings.availableBalance || 0)} ready for payout.
										{(summary?.earnings.availableBalance || 0) >= 1000 ? " Consider requesting a payout!" : " Complete more bookings to reach minimum payout threshold."}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
								<div>
									<p className="text-sm font-medium">Performance</p>
									<p className="text-xs text-muted-foreground">
										Your completion rate is {summary && summary.performance.totalBookings > 0
											? ((summary.performance.completedBookings / summary.performance.totalBookings) * 100).toFixed(1)
											: '0'}%. 
										{(summary?.performance.completedBookings || 0) < (summary?.performance.totalBookings || 0) 
											? " Focus on completing bookings to maximize earnings." 
											: " Great job maintaining a high completion rate!"}
									</p>
								</div>
							</div>
						</div>
						<div className="space-y-2">
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
								<div>
									<p className="text-sm font-medium">Growth Trend</p>
									<p className="text-xs text-muted-foreground">
										{earningsGrowthRate >= 0 
											? `Your earnings grew by ${earningsGrowthRate.toFixed(1)}% this month. Keep up the great work!`
											: `Your earnings decreased by ${Math.abs(earningsGrowthRate).toFixed(1)}% this month. Consider promoting your services or adjusting your strategy.`}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
								<div>
									<p className="text-sm font-medium">Student Reach</p>
									<p className="text-xs text-muted-foreground">
										You've served {summary?.performance.totalStudents || 0} unique students.
										{(summary?.performance.totalStudents || 0) < 10 
											? " Focus on attracting more students to grow your reach."
											: " You're building a solid student base!"}
									</p>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function EarningsOverviewSkeleton() {
	return (
		<div className="space-y-6">
			{/* Quick date selector skeleton */}
			<div className="flex gap-2">
				{[...Array(4)].map((_, i) => (
					<Skeleton key={i} className="h-8 w-20" />
				))}
			</div>
			
			{/* Performance cards skeleton */}
			<div className="grid gap-6 md:grid-cols-3">
				{[...Array(3)].map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-4 w-24" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-16 mb-2" />
							<Skeleton className="h-3 w-20" />
						</CardContent>
					</Card>
				))}
			</div>
			
			{/* Charts skeleton */}
			<div className="grid gap-6 lg:grid-cols-2">
				{[...Array(2)].map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-4 w-48" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-64 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
			
			{/* Key insights skeleton */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="flex items-start gap-3">
								<Skeleton className="w-2 h-2 rounded-full" />
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-3 w-full" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
