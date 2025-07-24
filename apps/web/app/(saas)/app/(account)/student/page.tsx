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
import {
	BookOpen,
	DollarSign,
	TrendingUp,
	Calendar,
	Plus,
	GraduationCap,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
	studentDashboardApi,
	studentDashboardQueryKeys,
} from "@/modules/student/api";
import { UpcomingBookingWidget } from "@/modules/student/components/upcoming-booking-widget";
import { RecentActivityWidget } from "@/modules/student/components/recent-activity-widget";
import { MyProvidersWidget } from "@/modules/student/components/my-providers-widget";

export default function StudentDashboard() {
	const {
		data: dashboardData,
		isLoading,
		error,
	} = useQuery({
		queryKey: studentDashboardQueryKeys.summary(),
		queryFn: () => studentDashboardApi.getSummary(),
	});

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
							Loading your dashboard...
						</p>
						<p className="text-sm text-muted-foreground">
							Please wait while we fetch your data
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-4 max-w-md">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
						<div className="w-8 h-8 bg-red-500 rounded-full" />
					</div>
					<div className="space-y-2">
						<h2 className="text-xl font-semibold text-red-600">
							Error Loading Dashboard
						</h2>
						<p className="text-sm text-muted-foreground">
							We're having trouble loading your dashboard data.
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
									<GraduationCap className="h-5 w-5 text-primary-foreground" />
								</div>
								<div>
									<h1 className="text-3xl font-bold tracking-tight text-foreground">
										Student Dashboard
									</h1>
									<p className="text-sm text-muted-foreground mt-1">
										Manage your bookings, discover services, and track your learning journey
									</p>
								</div>
							</div>
						</div>
						<div className="flex items-center space-x-3">
							<Badge variant="secondary" className="text-xs">
								<Calendar className="h-3 w-3 mr-1" />
								Active
							</Badge>
							<Button asChild variant="primary">
								<Link href="/app/services">
									<Plus className="h-4 w-4 mr-2" />
									Book Service
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="space-y-8">
					{/* Stats Cards Grid - Enhanced */}
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						<Card className="group hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 border-0 bg-card/70 backdrop-blur-lg hover:bg-card/80 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">
									Total Bookings
								</CardTitle>
								<div className="p-2 bg-primary rounded-lg group-hover:bg-primary/80 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
									<BookOpen className="h-4 w-4 text-primary-foreground transition-transform duration-300 group-hover:rotate-12" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold text-foreground transition-all duration-300 group-hover:text-primary group-hover:scale-105">
									{dashboardData?.stats.totalBookings || 0}
								</div>
								<div className="flex items-center mt-2 transition-all duration-300 group-hover:translate-x-1">
									<TrendingUp className="h-3 w-3 text-success mr-1 transition-all duration-300 group-hover:scale-110" />
									<p className="text-xs text-success font-medium transition-colors duration-300 group-hover:text-success/80">
										All time bookings
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="group hover:shadow-xl hover:shadow-secondary/20 transition-all duration-500 border-0 bg-card/70 backdrop-blur-lg hover:bg-card/80 cursor-pointer transform hover:scale-[1.02] hover:translate-x-1">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-foreground group-hover:text-secondary transition-colors duration-300">
									Completed
								</CardTitle>
								<div className="p-2 bg-secondary rounded-lg group-hover:bg-secondary/80 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
									<Calendar className="h-4 w-4 text-secondary-foreground transition-transform duration-300 group-hover:-rotate-12" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold text-foreground transition-all duration-300 group-hover:text-secondary group-hover:scale-110">
									{dashboardData?.stats.completedBookings || 0}
								</div>
								<div className="flex items-center mt-2 transition-all duration-300 group-hover:translate-x-2">
									<TrendingUp className="h-3 w-3 text-primary mr-1 transition-all duration-300 group-hover:scale-125" />
									<p className="text-xs text-primary font-medium transition-colors duration-300 group-hover:text-primary/80">
										Sessions completed
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="group hover:shadow-xl hover:shadow-accent/20 transition-all duration-500 border-0 bg-card/70 backdrop-blur-lg hover:bg-card/80 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 hover:rotate-1">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-foreground group-hover:text-accent transition-colors duration-300">
									Upcoming
								</CardTitle>
								<div className="p-2 bg-accent rounded-lg group-hover:bg-accent/80 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
									<Calendar className="h-4 w-4 text-accent-foreground transition-transform duration-300 group-hover:scale-125" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold text-foreground transition-all duration-300 group-hover:text-accent group-hover:scale-110 group-hover:rotate-2">
									{dashboardData?.stats.upcomingCount || 0}
								</div>
								<div className="flex items-center mt-2 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
									<Calendar className="h-3 w-3 text-primary mr-1 transition-all duration-300 group-hover:scale-125 group-hover:rotate-45" />
									<p className="text-xs text-muted-foreground font-medium transition-colors duration-300 group-hover:text-accent/80">
										Sessions scheduled
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="group hover:shadow-xl hover:shadow-green-500/20 transition-all duration-500 border-0 bg-card/70 backdrop-blur-lg hover:bg-card/80 cursor-pointer transform hover:scale-[1.02] hover:translate-x-1 hover:-translate-y-1">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-foreground group-hover:text-green-600 transition-colors duration-300">
									Total Spent
								</CardTitle>
								<div className="p-2 bg-green-500 rounded-lg group-hover:bg-green-600 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
									<DollarSign className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-180" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold text-foreground transition-all duration-300 group-hover:text-green-600 group-hover:scale-105">
									₦{(dashboardData?.stats.totalSpent || 0).toLocaleString()}
								</div>
								<div className="flex items-center mt-2 transition-all duration-300 group-hover:translate-x-2 group-hover:-translate-y-1">
									<TrendingUp className="h-3 w-3 text-success mr-1 transition-all duration-300 group-hover:scale-125 group-hover:rotate-90" />
									<p className="text-xs text-muted-foreground font-medium transition-colors duration-300 group-hover:text-green-600/80">
										Investment in learning
									</p>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Main Widgets Grid */}
					<div className="grid gap-6 lg:grid-cols-3">
						{/* Upcoming Bookings Widget */}
						<div className="lg:col-span-2">
							<UpcomingBookingWidget
								bookings={dashboardData?.upcomingBookings || []}
								isLoading={isLoading}
							/>
						</div>

						{/* My Providers Widget */}
						<div>
							<MyProvidersWidget
								providers={dashboardData?.myProviders || []}
								isLoading={isLoading}
							/>
						</div>
					</div>

					{/* Secondary Widgets Grid */}
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Recent Activity Widget */}
						<div>
							<RecentActivityWidget
								recentActivity={dashboardData?.recentActivity || []}
								isLoading={isLoading}
							/>
						</div>

						{/* Quick Actions Card */}
						<Card className="group hover:shadow-lg transition-all duration-300">
							<CardHeader className="pb-3">
								<CardTitle className="text-lg font-semibold flex items-center gap-2">
									<Plus className="h-5 w-5 text-primary" />
									Quick Actions
								</CardTitle>
								<CardDescription>Common tasks and shortcuts</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid gap-3">
									<Button asChild className="w-full justify-start" variant="outline">
										<Link href="/app/services">
											<BookOpen className="h-4 w-4 mr-2" />
											Browse Services
										</Link>
									</Button>
									<Button asChild className="w-full justify-start" variant="outline">
										<Link href="/app/student/bookings">
											<Calendar className="h-4 w-4 mr-2" />
											View My Bookings
										</Link>
									</Button>
									<Button asChild className="w-full justify-start" variant="outline">
										<Link href="/app/student/profile">
											<GraduationCap className="h-4 w-4 mr-2" />
											Update Profile
										</Link>
									</Button>
									<Button asChild className="w-full justify-start" variant="outline">
										<Link href="/app/providers">
											<TrendingUp className="h-4 w-4 mr-2" />
											Discover Providers
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
