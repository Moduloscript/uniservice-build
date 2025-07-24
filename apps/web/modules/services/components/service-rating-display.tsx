"use client";

import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchReviewStats } from "../api";

interface ServiceRatingDisplayProps {
	serviceId: string;
	/**
	 * Optional initial stats from server-side rendering
	 */
	initialStats?: {
		totalReviews: number;
		averageRating: number;
		ratingDistribution: Array<{
			rating: number;
			count: number;
			percentage: number;
		}>;
		lastReviewDate: string | null;
	};
}

const reviewStatsQueryKey = (serviceId: string) =>
	["reviews", "stats", serviceId] as const;

export function ServiceRatingDisplay({
	serviceId,
	initialStats,
}: ServiceRatingDisplayProps) {
	const {
		data: stats,
		isLoading,
		error,
	} = useQuery({
		queryKey: reviewStatsQueryKey(serviceId),
		queryFn: () => fetchReviewStats(serviceId),
		initialData: initialStats,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});

	if (isLoading) {
		return (
			<div className="flex items-center gap-1">
				<div className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin" />
				<span className="text-sm text-muted-foreground">
					Loading reviews...
				</span>
			</div>
		);
	}

	if (error) {
		console.error("Review stats error:", error);
		// Fallback to show that reviews couldn't be loaded
		return (
			<div className="flex items-center gap-1">
				<Star className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm text-muted-foreground">
					No reviews yet
				</span>
			</div>
		);
	}

	if (!stats || stats.totalReviews === 0) {
		return (
			<div className="flex items-center gap-1">
				<Star className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm text-muted-foreground">
					No reviews yet
				</span>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-1">
			<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
			<span className="text-sm font-medium">{stats.averageRating}/5</span>
			<span className="text-sm text-muted-foreground">
				({stats.totalReviews} review
				{stats.totalReviews !== 1 ? "s" : ""})
			</span>
		</div>
	);
}
