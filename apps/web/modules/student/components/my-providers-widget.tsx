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
	Users,
	Star,
	ArrowRight,
	UserCheck,
	Heart,
} from "lucide-react";
import Link from "next/link";
import type { StudentProvider } from "../api";

interface MyProvidersWidgetProps {
	providers: StudentProvider[];
	isLoading?: boolean;
}

export function MyProvidersWidget({
	providers,
	isLoading,
}: MyProvidersWidgetProps) {
	if (isLoading) {
		return (
			<Card className="group hover:shadow-lg transition-all duration-300">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-lg font-semibold flex items-center gap-2">
								<Users className="h-5 w-5 text-accent" />
								My Providers
							</CardTitle>
							<CardDescription>Your trusted service providers</CardDescription>
						</div>
						<div className="animate-pulse bg-muted rounded h-4 w-8" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="animate-pulse">
								<div className="flex items-center space-x-3">
									<div className="w-12 h-12 bg-muted rounded-full" />
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

	if (providers.length === 0) {
		return (
			<Card className="group hover:shadow-lg transition-all duration-300">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-lg font-semibold flex items-center gap-2">
								<Users className="h-5 w-5 text-accent" />
								My Providers
							</CardTitle>
							<CardDescription>Your trusted service providers</CardDescription>
						</div>
						<Badge variant="secondary" className="text-xs">
							0
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<Heart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
						<p className="text-muted-foreground text-sm">
							No favorite providers yet
						</p>
						<p className="text-muted-foreground text-xs mt-1">
							Book services to build relationships with providers
						</p>
						<Button asChild className="mt-4" size="sm" variant="outline">
							<Link href="/app/services">Find Providers</Link>
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
							<Users className="h-5 w-5 text-accent" />
							My Providers
						</CardTitle>
						<CardDescription>Your trusted service providers</CardDescription>
					</div>
					<Badge variant="secondary" className="text-xs">
						{providers.length}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{providers.map((provider) => (
						<div
							key={provider.id}
							className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
						>
							<div className="flex items-center space-x-3">
								<div className="relative">
									<Avatar className="h-12 w-12">
										<AvatarImage
											src={provider.image}
											alt={provider.name}
										/>
										<AvatarFallback>
											{provider.name
												.split(" ")
												.map((n) => n[0])
												.join("")
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
										<UserCheck className="h-2.5 w-2.5 text-primary-foreground" />
									</div>
								</div>
								<div className="flex-1">
									<p className="font-medium text-sm leading-none">
										{provider.name}
									</p>
									<div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
										<span className="flex items-center gap-1">
											<Star className="h-3 w-3" />
											{provider._count.services} service{provider._count.services !== 1 ? 's' : ''}
										</span>
										<span>
											{provider.bookingCount} booking{provider.bookingCount !== 1 ? 's' : ''}
										</span>
									</div>
								</div>
							</div>
							<div className="text-right">
								<Button
									asChild
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
								>
									<Link href={`/app/providers/${provider.id}`}>
										<ArrowRight className="h-4 w-4" />
									</Link>
								</Button>
							</div>
						</div>
					))}
				</div>
				{providers.length > 0 && (
					<div className="mt-4 pt-4 border-t">
						<Button asChild variant="outline" size="sm" className="w-full">
							<Link href="/app/providers" className="flex items-center">
								Explore All Providers
								<ArrowRight className="h-4 w-4 ml-2" />
							</Link>
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
