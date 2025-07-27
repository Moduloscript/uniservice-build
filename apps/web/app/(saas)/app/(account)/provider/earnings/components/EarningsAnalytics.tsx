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
import { Badge } from "@ui/components/badge";
import { Skeleton } from "@ui/components/skeleton";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Area,
	AreaChart,
} from "recharts";
import {
	TrendingUp,
	TrendingDown,
	Target,
	Users,
	Calendar,
	Star,
	BookOpen,
	DollarSign,
	Activity,
} from "lucide-react";
import {
	providerEarningsApi,
	providerEarningsQueryKeys,
} from "@/modules/provider/api";

interface EarningsAnalyticsProps {
	dateRange: { startDate?: string; endDate?: string };
}

export function EarningsAnalytics({ dateRange }: EarningsAnalyticsProps) {
	// Fetch various analytics data
	const { data: earningsOverTime, isLoading: isLoadingEarningsOverTime } = useQuery({
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

	const { data: earningsByService, isLoading: isLoadingEarningsByService } = useQuery({
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

	const { data: hourlyPerformance, isLoading: isLoadingHourlyPerformance } = useQuery({
		queryKey: providerEarningsQueryKeys.analytics({
			report: "hourly_performance",
			...dateRange,
		}),
		queryFn: () =>
			providerEarningsApi.getAnalytics({
				report: "hourly_performance",
				...dateRange,
			}),
		staleTime: 5 * 60 * 1000,
	});

	const { data: monthlyComparison, isLoading: isLoadingMonthlyComparison } = useQuery({
		queryKey: providerEarningsQueryKeys.analytics({
			report: "monthly_comparison",
			...dateRange,
		}),
		queryFn: () =>
			providerEarningsApi.getAnalytics({
				report: "monthly_comparison",
				...dateRange,
			}),
		staleTime: 5 * 60 * 1000,
	});

	const { data: studentRetention, isLoading: isLoadingStudentRetention } = useQuery({
		queryKey: providerEarningsQueryKeys.analytics({
			report: "student_retention",
			...dateRange,
		}),
		queryFn: () =>
			providerEarningsApi.getAnalytics({
				report: "student_retention",
				...dateRange,
			}),
		staleTime: 5 * 60 * 1000,
	});

	const { data: performanceMetrics, isLoading: isLoadingPerformanceMetrics } = useQuery({
		queryKey: providerEarningsQueryKeys.analytics({
			report: "performance_metrics",
			...dateRange,
		}),
		queryFn: () =>
			providerEarningsApi.getAnalytics({
				report: "performance_metrics",
				...dateRange,
			}),
		staleTime: 5 * 60 * 1000,
	});

	// Format currency
	const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

	// Colors for charts
	const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];

	// Mock data for demonstration (remove when API is fully implemented)
	const mockPerformanceData = [
		{ month: 'Jan', earnings: 45000, bookings: 12, rating: 4.8 },
		{ month: 'Feb', earnings: 52000, bookings: 14, rating: 4.7 },
		{ month: 'Mar', earnings: 38000, bookings: 10, rating: 4.9 },
		{ month: 'Apr', earnings: 61000, bookings: 16, rating: 4.6 },
		{ month: 'May', earnings: 55000, bookings: 15, rating: 4.8 },
		{ month: 'Jun', earnings: 48000, bookings: 13, rating: 4.7 },
	];

	const mockServiceData = [
		{ name: 'Math Tutoring', value: 35, earnings: 125000 },
		{ name: 'Physics Help', value: 25, earnings: 89000 },
		{ name: 'Chemistry Lab', value: 20, earnings: 67000 },
		{ name: 'Essay Writing', value: 15, earnings: 45000 },
		{ name: 'Exam Prep', value: 5, earnings: 23000 },
	];

	const mockHourlyData = [
		{ hour: '8AM', bookings: 2, earnings: 8000 },
		{ hour: '10AM', bookings: 5, earnings: 18000 },
		{ hour: '12PM', bookings: 8, earnings: 28000 },
		{ hour: '2PM', bookings: 12, earnings: 45000 },
		{ hour: '4PM', bookings: 15, earnings: 52000 },
		{ hour: '6PM', bookings: 10, earnings: 35000 },
		{ hour: '8PM', bookings: 6, earnings: 22000 },
	];

	return (
		<div className="space-y-6">
			{/* Key Performance Indicators */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Avg. Per Booking</CardTitle>
						<DollarSign className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">₦3,500</div>
						<div className="flex items-center text-xs text-muted-foreground">
							<TrendingUp className="h-3 w-3 text-green-500 mr-1" />
							+12% from last month
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Success Rate</CardTitle>
						<Target className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">94.2%</div>
						<div className="flex items-center text-xs text-muted-foreground">
							<TrendingUp className="h-3 w-3 text-green-500 mr-1" />
							+2.1% from last month
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
						<Star className="h-4 w-4 text-purple-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">4.8</div>
						<div className="flex items-center text-xs text-muted-foreground">
							<Star className="h-3 w-3 text-yellow-500 mr-1" />
							Based on 127 reviews
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Repeat Students</CardTitle>
						<Users className="h-4 w-4 text-orange-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">68%</div>
						<div className="flex items-center text-xs text-muted-foreground">
							<Activity className="h-3 w-3 text-orange-500 mr-1" />
							Strong retention rate
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Charts Section */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Earnings Performance Over Time */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							Performance Trend
						</CardTitle>
						<CardDescription>
							Your earnings and booking trends over time
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoadingEarningsOverTime ? (
							<Skeleton className="h-64 w-full" />
						) : (
							<ResponsiveContainer width="100%" height={250}>
								<AreaChart data={earningsOverTime?.data || mockPerformanceData}>
									<defs>
										<linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
									<XAxis 
										dataKey="month" 
										fontSize={11}
									/>
									<YAxis 
										fontSize={11}
										tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
									/>
									<Tooltip
										formatter={(value: number, name: string) => [
											name === 'earnings' ? formatCurrency(value) : value,
											name === 'earnings' ? 'Earnings' : 'Bookings'
										]}
										contentStyle={{
											backgroundColor: 'var(--card)',
											border: '1px solid var(--border)',
											borderRadius: '8px',
										}}
									/>
									<Area
										type="monotone"
										dataKey="earnings"
										stroke="#8884d8"
										fillOpacity={1}
										fill="url(#earningsGradient)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				{/* Service Performance Breakdown */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							Service Breakdown
						</CardTitle>
						<CardDescription>
							Revenue distribution by service type
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoadingEarningsByService ? (
							<Skeleton className="h-64 w-full" />
						) : (
							<ResponsiveContainer width="100%" height={250}>
								<PieChart>
									<Pie
										data={earningsByService?.data || mockServiceData}
										cx="50%"
										cy="50%"
										outerRadius={80}
										dataKey="value"
										label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
									>
										{(earningsByService?.data || mockServiceData).map((entry, index) => (
											<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
										))}
									</Pie>
									<Tooltip
										formatter={(value: number, name: string) => [
											`${value}%`,
											'Share'
										]}
										contentStyle={{
											backgroundColor: 'var(--card)',
											border: '1px solid var(--border)',
											borderRadius: '8px',
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				{/* Peak Hours Analysis */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							Peak Hours
						</CardTitle>
						<CardDescription>
							When you earn the most throughout the day
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoadingHourlyPerformance ? (
							<Skeleton className="h-64 w-full" />
						) : (
							<ResponsiveContainer width="100%" height={250}>
								<BarChart data={hourlyPerformance?.data || mockHourlyData}>
									<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
									<XAxis 
										dataKey="hour" 
										fontSize={11}
									/>
									<YAxis 
										fontSize={11}
										tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
									/>
									<Tooltip
										formatter={(value: number) => [formatCurrency(value), 'Earnings']}
										contentStyle={{
											backgroundColor: 'var(--card)',
											border: '1px solid var(--border)',
											borderRadius: '8px',
										}}
									/>
									<Bar 
										dataKey="earnings" 
										fill="#82ca9d"
										radius={[2, 2, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				{/* Bookings vs Rating Correlation */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Star className="h-5 w-5" />
							Performance Quality
						</CardTitle>
						<CardDescription>
							Correlation between bookings and ratings
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={250}>
							<LineChart data={mockPerformanceData}>
								<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
								<XAxis 
									dataKey="month" 
									fontSize={11}
								/>
								<YAxis 
									yAxisId="left"
									fontSize={11}
								/>
								<YAxis 
									yAxisId="right" 
									orientation="right"
									fontSize={11}
									domain={[4.0, 5.0]}
								/>
								<Tooltip
									formatter={(value: number, name: string) => [
										name === 'rating' ? `${value}/5.0` : value,
										name === 'rating' ? 'Rating' : 'Bookings'
									]}
									contentStyle={{
										backgroundColor: 'var(--card)',
										border: '1px solid var(--border)',
										borderRadius: '8px',
									}}
								/>
								<Line 
									yAxisId="left"
									type="monotone" 
									dataKey="bookings" 
									stroke="#8884d8" 
									strokeWidth={2}
									dot={{ r: 4 }}
								/>
								<Line 
									yAxisId="right"
									type="monotone" 
									dataKey="rating" 
									stroke="#82ca9d" 
									strokeWidth={2}
									dot={{ r: 4 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Insights and Recommendations */}
			<Card className="border-0 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-cyan-950/20">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5" />
						Performance Insights
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
								<div>
									<p className="text-sm font-medium">Peak Performance</p>
									<p className="text-xs text-muted-foreground">
										Your busiest hours are 2PM-6PM, accounting for 60% of daily earnings.
										Consider expanding availability during these times.
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
								<div>
									<p className="text-sm font-medium">Service Popularity</p>
									<p className="text-xs text-muted-foreground">
										Math Tutoring is your top earner at 35% of total revenue.
										Consider creating specialized math courses.
									</p>
								</div>
							</div>
						</div>
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
								<div>
									<p className="text-sm font-medium">Quality Consistency</p>
									<p className="text-xs text-muted-foreground">
										Your 4.8 average rating shows excellent service quality.
										Maintain this standard to attract premium bookings.
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
								<div>
									<p className="text-sm font-medium">Growth Opportunity</p>
									<p className="text-xs text-muted-foreground">
										68% repeat student rate indicates strong satisfaction.
										Focus on acquiring new students to grow your base.
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
