"use client";

import { useQuery } from "@tanstack/react-query";
import { Target, AlertCircle, Loader2, Award } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../ui/components/card";
import { fetchServiceOutcomes } from "../api";
import type { ServiceOutcome } from "../types/service-outcome";
import { formatErrorMessage } from "../utils/error-formatting";
import { cn } from "../../ui/lib";

interface ServiceOutcomesProps {
	serviceId: string;
	className?: string;
}

export function ServiceOutcomes({
	serviceId,
	className = "",
}: ServiceOutcomesProps) {
	const {
		data: outcomes = [],
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["service-outcomes", serviceId],
		queryFn: () => fetchServiceOutcomes(serviceId),
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
						<span className="text-lg">
							Loading learning outcomes...
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div
						className="space-y-3"
						role="status"
						aria-label="Loading service learning outcomes"
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
						<span className="text-lg">
							Error Loading Learning Outcomes
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-destructive/80 text-sm" role="alert">
						{formatErrorMessage(
							error,
							"Failed to load service learning outcomes",
						)}
					</p>
				</CardContent>
			</Card>
		);
	}

	if (outcomes.length === 0) {
		return (
			<Card className={cn("bg-muted/30", className)}>
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2 text-muted-foreground">
						<Award className="w-5 h-5" />
						<span className="text-lg">Learning Outcomes</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						No learning outcomes have been defined for this service
						yet. The provider may add specific learning goals soon.
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
					<Target className="w-5 h-5" />
					<span className="text-lg">Learning Outcomes</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div
					className="space-y-4"
					role="list"
					aria-label="Service learning outcomes"
				>
					{outcomes.map((outcome: ServiceOutcome, index: number) => (
						<div
							key={outcome.id}
							className="flex items-start gap-3 group transition-colors duration-150 hover:bg-muted/20 -mx-2 px-2 py-2 rounded-md"
							role="listitem"
						>
							<div className="flex-shrink-0 mt-0.5">
								<Target className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="font-medium text-foreground group-hover:text-foreground/90 text-sm sm:text-base">
									{outcome.title}
								</h4>
								{outcome.description && (
									<p className="text-muted-foreground text-xs sm:text-sm mt-1 leading-relaxed">
										{outcome.description}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
				{outcomes.length > 0 && (
					<div className="mt-4 pt-4 border-t border-muted">
						<p className="text-xs text-muted-foreground text-center">
							{outcomes.length} learning outcome
							{outcomes.length !== 1 ? "s" : ""} defined for this
							service
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

interface ServiceOutcomesServerProps {
	outcomes: ServiceOutcome[];
	className?: string;
}

// Server-side version that takes outcomes as props (for SSR)
export function ServiceOutcomesServer({
	outcomes,
	className = "",
}: ServiceOutcomesServerProps) {
	if (outcomes.length === 0) {
		return (
			<Card className={cn("bg-muted/30", className)}>
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2 text-muted-foreground">
						<Award className="w-5 h-5" />
						<span className="text-lg">Learning Outcomes</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						No learning outcomes have been defined for this service
						yet. The provider may add specific learning goals soon.
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
					<Target className="w-5 h-5" />
					<span className="text-lg">Learning Outcomes</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div
					className="space-y-4"
					role="list"
					aria-label="Service learning outcomes"
				>
					{outcomes.map((outcome: ServiceOutcome) => (
						<div
							key={outcome.id}
							className="flex items-start gap-3 group transition-colors duration-150 hover:bg-muted/20 -mx-2 px-2 py-2 rounded-md"
							role="listitem"
						>
							<div className="flex-shrink-0 mt-0.5">
								<Target className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="font-medium text-foreground group-hover:text-foreground/90 text-sm sm:text-base">
									{outcome.title}
								</h4>
								{outcome.description && (
									<p className="text-muted-foreground text-xs sm:text-sm mt-1 leading-relaxed">
										{outcome.description}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
				{outcomes.length > 0 && (
					<div className="mt-4 pt-4 border-t border-muted">
						<p className="text-xs text-muted-foreground text-center">
							{outcomes.length} learning outcome
							{outcomes.length !== 1 ? "s" : ""} defined for this
							service
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
