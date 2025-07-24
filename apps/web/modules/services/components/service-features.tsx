"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, AlertCircle, Loader2, Sparkles } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../ui/components/card";
import { fetchServiceFeatures } from "../api";
import type { ServiceFeature } from "../types/service-feature";
import { formatErrorMessage } from "../utils/error-formatting";
import { cn } from "../../ui/lib";

interface ServiceFeaturesProps {
	serviceId: string;
	className?: string;
}

export function ServiceFeatures({
	serviceId,
	className = "",
}: ServiceFeaturesProps) {
	const {
		data: features = [],
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["service-features", serviceId],
		queryFn: () => fetchServiceFeatures(serviceId),
		enabled: !!serviceId,
		staleTime: 30 * 1000, // 30 seconds
		retry: 2,
	});

	if (isLoading) {
		return (
			<Card className={cn("transition-all duration-200", className)}>
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2">
						<Loader2 className="w-5 h-5 animate-spin text-primary" />
						<span className="text-lg">Loading features...</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div
						className="space-y-3"
						role="status"
						aria-label="Loading service features"
					>
						{[...Array(4)].map((_, i) => (
							<div
								key={i}
								className="flex items-start gap-3 animate-pulse"
							>
								<div className="w-5 h-5 bg-muted rounded-full" />
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-muted rounded-md" />
									<div className="h-3 bg-muted/60 rounded-md w-2/3" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (isError) {
		return (
			<Card
				className={cn(
					"border-destructive/20 bg-destructive/5",
					className,
				)}
			>
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2 text-destructive">
						<AlertCircle className="w-5 h-5" />
						<span className="text-lg">Error Loading Features</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-destructive/80 text-sm" role="alert">
						{formatErrorMessage(
							error,
							"Failed to load service features",
						)}
					</p>
				</CardContent>
			</Card>
		);
	}

	if (features.length === 0) {
		return (
			<Card className={cn("bg-muted/30", className)}>
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2 text-muted-foreground">
						<Sparkles className="w-5 h-5" />
						<span className="text-lg">What's Included</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						No features have been added to this service yet. The
						provider may add custom features soon.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card
			className={cn(
				"transition-all duration-200 hover:shadow-md",
				className,
			)}
		>
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2 text-primary">
					<CheckCircle className="w-5 h-5" />
					<span className="text-lg">What's Included</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div
					className="space-y-4"
					role="list"
					aria-label="Service features"
				>
					{features.map((feature: ServiceFeature, index: number) => (
						<div
							key={feature.id}
							className="flex items-start gap-3 group transition-colors duration-150 hover:bg-muted/20 -mx-2 px-2 py-2 rounded-md"
							role="listitem"
						>
							<div className="flex-shrink-0 mt-0.5">
								<CheckCircle className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="font-medium text-foreground group-hover:text-foreground/90 text-sm sm:text-base">
									{feature.title}
								</h4>
								{feature.description && (
									<p className="text-muted-foreground text-xs sm:text-sm mt-1 leading-relaxed">
										{feature.description}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
				{features.length > 0 && (
					<div className="mt-4 pt-4 border-t border-muted">
						<p className="text-xs text-muted-foreground text-center">
							{features.length} feature
							{features.length !== 1 ? "s" : ""} included with
							this service
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

interface ServiceFeaturesServerProps {
	features: ServiceFeature[];
	className?: string;
}

// Server-side version that takes features as props (for SSR)
export function ServiceFeaturesServer({
	features,
	className = "",
}: ServiceFeaturesServerProps) {
	if (features.length === 0) {
		return (
			<Card className={cn("bg-muted/30", className)}>
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2 text-muted-foreground">
						<Sparkles className="w-5 h-5" />
						<span className="text-lg">What's Included</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						No features have been added to this service yet. The
						provider may add custom features soon.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card
			className={cn(
				"transition-all duration-200 hover:shadow-md",
				className,
			)}
		>
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2 text-primary">
					<CheckCircle className="w-5 h-5" />
					<span className="text-lg">What's Included</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div
					className="space-y-4"
					role="list"
					aria-label="Service features"
				>
					{features.map((feature: ServiceFeature) => (
						<div
							key={feature.id}
							className="flex items-start gap-3 group transition-colors duration-150 hover:bg-muted/20 -mx-2 px-2 py-2 rounded-md"
							role="listitem"
						>
							<div className="flex-shrink-0 mt-0.5">
								<CheckCircle className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="font-medium text-foreground group-hover:text-foreground/90 text-sm sm:text-base">
									{feature.title}
								</h4>
								{feature.description && (
									<p className="text-muted-foreground text-xs sm:text-sm mt-1 leading-relaxed">
										{feature.description}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
				{features.length > 0 && (
					<div className="mt-4 pt-4 border-t border-muted">
						<p className="text-xs text-muted-foreground text-center">
							{features.length} feature
							{features.length !== 1 ? "s" : ""} included with
							this service
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
