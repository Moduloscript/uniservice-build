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
	Activity,
	Clock,
	ArrowRight,
	CheckCircle,
	History,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { StudentBooking } from "../api";

interface RecentActivityWidgetProps {
	recentActivity: StudentBooking[];
	isLoading?: boolean;
}

export function RecentActivityWidget({
	recentActivity,
	isLoading,
}: RecentActivityWidgetProps) {
	if (isLoading) {
		return (
			<Card className="group hover:shadow-lg transition-all duration-300">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-lg font-semibold flex items-center gap-2">
								<Activity className="h-5 w-5 text-secondary" />
								Recent Activity
							</CardTitle>
							<CardDescription>Your completed sessions</CardDescription>
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

	if (recentActivity.length === 0) {
		return (
			<Card className="group hover:shadow-lg transition-all duration-300">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-lg font-semibold flex items-center gap-2">
								<Activity className="h-5 w-5 text-secondary" />
								Recent Activity
							</CardTitle>
							<CardDescription>Your completed sessions</CardDescription>
						</div>
						<Badge variant="secondary" className="text-xs">
							0
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<History className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
						<p className="text-muted-foreground text-sm">
							No recent activity
						</p>
						<p className="text-muted-foreground text-xs mt-1">
							Complete your first booking to see activity here
						</p>
						<Button asChild className="mt-4" size="sm" variant="secondary">
							<Link href="/app/services">Explore Services</Link>
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
							<Activity className="h-5 w-5 text-secondary" />
							Recent Activity
						</CardTitle>
						<CardDescription>Your completed sessions</CardDescription>
					</div>
					<Badge variant="secondary" className="text-xs">
						{recentActivity.length}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{recentActivity.map((activity) => (
						<div
							key={activity.id}
							className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
						>
							<div className="flex items-center space-x-3">
								<div className="relative">
									<Avatar className="h-10 w-10">
										<AvatarImage
											src={activity.provider.image}
											alt={activity.provider.name}
										/>
										<AvatarFallback>
											{activity.provider.name
												.split(" ")
												.map((n) => n[0])
												.join("")
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
										<CheckCircle className="h-2.5 w-2.5 text-white" />
									</div>
								</div>
								<div className="flex-1">
									<p className="font-medium text-sm leading-none">
										{activity.service.name}
									</p>
									<div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
										<span>with {activity.provider.name}</span>
										<span className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											{formatDistanceToNow(new Date(activity.updatedAt!), {
												addSuffix: true,
											})}
										</span>
									</div>
								</div>
							</div>
							<div className="text-right">
								<Badge variant="outline" className="text-xs mb-1">
									completed
								</Badge>
								<p className="font-medium text-sm">
									₦{activity.service.price.toLocaleString()}
								</p>
							</div>
						</div>
					))}
				</div>
				{recentActivity.length > 0 && (
					<div className="mt-4 pt-4 border-t">
						<Button asChild variant="outline" size="sm" className="w-full">
							<Link href="/app/student/bookings?tab=completed" className="flex items-center">
								View All History
								<ArrowRight className="h-4 w-4 ml-2" />
							</Link>
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
