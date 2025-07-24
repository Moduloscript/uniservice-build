"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@ui/components/button";
import { Badge } from "@ui/components/badge";
import { Separator } from "@ui/components/separator";
import {
	LayoutDashboard,
	Settings,
	BarChart3,
	User,
	Plus,
	ChevronRight,
	Home,
	Bell,
	Calendar,
} from "lucide-react";
import { cn } from "@ui/lib";
import { useProviderAuth } from "../hooks/useProviderAuth";
import { useQuery } from "@tanstack/react-query";
import { providerDashboardApi } from "@/modules/provider/api";

interface NavigationItem {
	label: string;
	href: string;
	icon: React.ElementType;
	badge?: string;
	isActive?: boolean;
}

export function ProviderNavigation() {
	const pathname = usePathname();
	const { user, isLoading } = useProviderAuth();

	// Fetch provider stats for badge indicators
	const { data: stats } = useQuery({
		queryKey: ["provider-dashboard-stats"],
		queryFn: () => providerDashboardApi.getStats(),
		enabled: !!user,
		refetchInterval: 30000, // Refresh every 30 seconds
	});

	const navigationItems: NavigationItem[] = [
		{
			label: "Dashboard",
			href: "/app/provider",
			icon: LayoutDashboard,
			isActive: pathname === "/app/provider",
		},
		{
			label: "My Services",
			href: "/app/provider/services",
			icon: Settings,
			isActive: pathname?.startsWith("/app/provider/services"),
		},
		{
			label: "Availability",
			href: "/app/provider/availability",
			icon: Calendar,
			isActive: pathname?.startsWith("/app/provider/availability"),
		},
		{
			label: "Analytics",
			href: "/app/provider/analytics",
			icon: BarChart3,
			isActive: pathname === "/app/provider/analytics",
			badge: "Soon",
		},
		{
			label: "Profile",
			href: "/app/provider/profile",
			icon: User,
			isActive: pathname === "/app/provider/profile",
		},
	];

	// Generate breadcrumbs based on current path
	const generateBreadcrumbs = () => {
		const segments = pathname?.split("/").filter(Boolean) || [];
		const breadcrumbs = [];

		if (segments.includes("provider")) {
			breadcrumbs.push({ label: "Provider", href: "/app/provider" });

			if (segments.includes("services")) {
				breadcrumbs.push({
					label: "Services",
					href: "/app/provider/services",
				});

				if (segments.includes("new")) {
					breadcrumbs.push({
						label: "New Service",
						href: "/app/provider/services/new",
					});
				} else if (segments.includes("edit")) {
					breadcrumbs.push({ label: "Edit Service", href: "#" });
				} else if (segments.includes("features")) {
					breadcrumbs.push({ label: "Manage Features", href: "#" });
				}
			} else if (segments.includes("availability")) {
				breadcrumbs.push({
					label: "Availability",
					href: "/app/provider/availability",
				});
			}
		}

		return breadcrumbs;
	};

	const breadcrumbs = generateBreadcrumbs();

	return (
		<>
			{/* Top Navigation Bar */}
			<div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 transition-all duration-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						{/* Breadcrumbs */}
						<div className="flex items-center space-x-2">
							<Link
								href="/app"
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								<Home className="h-4 w-4" />
							</Link>
							{breadcrumbs.map((breadcrumb, index) => (
								<div
									key={breadcrumb.href}
									className="flex items-center space-x-2"
								>
									<ChevronRight className="h-4 w-4 text-muted-foreground" />
									<Link
										href={breadcrumb.href}
										className={cn(
											"text-sm font-medium transition-colors hover:text-foreground",
											index === breadcrumbs.length - 1
												? "text-foreground"
												: "text-muted-foreground",
										)}
									>
										{breadcrumb.label}
									</Link>
								</div>
							))}
						</div>

						{/* User Info and Actions */}
						<div className="flex items-center space-x-4">
							{/* Provider Stats Badge */}
							{stats && (
								<div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
									<span>
										{stats.services?.total || 0} Services
									</span>
									<Separator
										orientation="vertical"
										className="h-4"
									/>
									<span>
										{stats.bookings?.total || 0} Bookings
									</span>
								</div>
							)}

							{/* Notification Bell */}
							<Button
								variant="ghost"
								size="sm"
								className="relative"
							>
								<Bell className="h-4 w-4" />
								{/* Notification dot */}
								<span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
							</Button>

							{/* User Profile */}
							<div className="flex items-center space-x-2">
								<div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
									{user?.name?.charAt(0) || "P"}
								</div>
								<div className="hidden md:block">
									<p className="text-sm font-medium">
										{user?.name || "Provider"}
									</p>
									<p className="text-xs text-muted-foreground">
										{user?.isVerified
											? "Verified"
											: "Pending Verification"}
									</p>
								</div>
							</div>

							{/* Add Service Button */}
							<Button asChild size="sm" variant="default">
								<Link href="/app/provider/services/new">
									<Plus className="h-4 w-4 mr-2" />
									Add Service
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Navigation Sidebar */}
			<div className="border-b bg-muted/10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center space-x-8 py-4">
						{navigationItems.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground pb-2 border-b-2 transition-all px-3 py-2 rounded-lg",
										item.isActive
											? "text-foreground border-primary bg-primary/10"
											: "text-muted-foreground border-transparent hover:bg-muted/50",
									)}
								>
									<Icon className="h-4 w-4" />
									<span>{item.label}</span>
									{item.badge && (
										<Badge
											variant="secondary"
											className="text-xs"
										>
											{item.badge}
										</Badge>
									)}
								</Link>
							);
						})}
					</div>
				</div>
			</div>

			{/* Secondary Navigation (if on services pages) */}
			{pathname?.startsWith("/app/provider/services") && (
				<div className="border-b bg-muted/30">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex items-center space-x-8 py-3">
							<Link
								href="/app/provider/services"
								className={cn(
									"text-sm font-medium transition-colors hover:text-foreground pb-2 border-b-2 transition-all",
									pathname === "/app/provider/services"
										? "text-foreground border-primary"
										: "text-muted-foreground border-transparent",
								)}
							>
								All Services
							</Link>
							<Link
								href="/app/provider/services/new"
								className={cn(
									"text-sm font-medium transition-colors hover:text-foreground pb-2 border-b-2 transition-all",
									pathname === "/app/provider/services/new"
										? "text-foreground border-primary"
										: "text-muted-foreground border-transparent",
								)}
							>
								Create New
							</Link>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
