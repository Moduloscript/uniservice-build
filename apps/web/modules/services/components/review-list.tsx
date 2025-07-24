"use client";

import { useState } from "react";
import { Star, Filter, SortDesc } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../ui/components/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/components/select";
import { ReviewItem } from "./review-item";
import { StarRating } from "./star-rating";
import type { Review } from "../types/review";
import { cn } from "../../ui/lib";

interface ReviewListProps {
	reviews: Review[];
	currentUserId?: string;
	isAdmin?: boolean;
	onEditReview?: (review: Review) => void;
	onDeleteReview?: (reviewId: string) => void;
	className?: string;
}

export function ReviewList({
	reviews,
	currentUserId,
	isAdmin = false,
	onEditReview,
	onDeleteReview,
	className,
}: ReviewListProps) {
	const [sortBy, setSortBy] = useState<
		"newest" | "oldest" | "rating-high" | "rating-low"
	>("newest");
	const [filterBy, setFilterBy] = useState<
		"all" | "1" | "2" | "3" | "4" | "5"
	>("all");

	// Calculate review statistics
	const totalReviews = reviews.length;
	const averageRating =
		totalReviews > 0
			? reviews.reduce((sum, review) => sum + review.rating, 0) /
				totalReviews
			: 0;

	const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
		const rating = i + 1;
		const count = reviews.filter((r) => r.rating === rating).length;
		const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
		return { rating, count, percentage };
	}).reverse();

	// Filter reviews
	const filteredReviews = reviews.filter((review) => {
		if (filterBy === "all") return true;
		return review.rating === Number.parseInt(filterBy);
	});

	// Sort reviews
	const sortedReviews = [...filteredReviews].sort((a, b) => {
		switch (sortBy) {
			case "newest":
				return (
					new Date(b.createdAt).getTime() -
					new Date(a.createdAt).getTime()
				);
			case "oldest":
				return (
					new Date(a.createdAt).getTime() -
					new Date(b.createdAt).getTime()
				);
			case "rating-high":
				return b.rating - a.rating;
			case "rating-low":
				return a.rating - b.rating;
			default:
				return 0;
		}
	});

	if (totalReviews === 0) {
		return (
			<Card className={className}>
				<CardContent className="p-8 text-center">
					<div className="flex flex-col items-center gap-4">
						<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
							<Star className="h-8 w-8 text-muted-foreground" />
						</div>
						<div>
							<h3 className="text-lg font-semibold">
								No reviews yet
							</h3>
							<p className="text-muted-foreground">
								Be the first to leave a review!
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className={cn("space-y-6", className)}>
			{/* Review Statistics */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
						Reviews & Ratings
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Overall Rating */}
						<div className="space-y-2">
							<div className="flex items-center gap-3">
								<span className="text-3xl font-bold">
									{averageRating.toFixed(1)}
								</span>
								<div>
									<StarRating
										rating={Math.round(averageRating)}
										size="md"
									/>
									<p className="text-sm text-muted-foreground">
										Based on {totalReviews}{" "}
										{totalReviews === 1
											? "review"
											: "reviews"}
									</p>
								</div>
							</div>
						</div>

						{/* Rating Distribution */}
						<div className="space-y-2">
							{ratingDistribution.map(
								({ rating, count, percentage }) => (
									<div
										key={rating}
										className="flex items-center gap-2"
									>
										<span className="text-sm font-medium w-6">
											{rating}
										</span>
										<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
										<div className="flex-1 bg-muted rounded-full h-2">
											<div
												className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
												style={{
													width: `${percentage}%`,
												}}
											/>
										</div>
										<span className="text-sm text-muted-foreground w-8">
											{count}
										</span>
									</div>
								),
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Filters and Sorting */}
			<div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
				<div className="flex items-center gap-2">
					<Filter className="h-4 w-4 text-muted-foreground" />
					<Select
						value={filterBy}
						onValueChange={(value: typeof filterBy) =>
							setFilterBy(value)
						}
					>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="Filter by rating" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All ratings</SelectItem>
							<SelectItem value="5">5 stars</SelectItem>
							<SelectItem value="4">4 stars</SelectItem>
							<SelectItem value="3">3 stars</SelectItem>
							<SelectItem value="2">2 stars</SelectItem>
							<SelectItem value="1">1 star</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2">
					<SortDesc className="h-4 w-4 text-muted-foreground" />
					<Select
						value={sortBy}
						onValueChange={(value: typeof sortBy) =>
							setSortBy(value)
						}
					>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="newest">Newest first</SelectItem>
							<SelectItem value="oldest">Oldest first</SelectItem>
							<SelectItem value="rating-high">
								Highest rated
							</SelectItem>
							<SelectItem value="rating-low">
								Lowest rated
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Reviews List */}
			<div className="space-y-4">
				{sortedReviews.map((review) => (
					<ReviewItem
						key={review.id}
						review={review}
						currentUserId={currentUserId}
						isAdmin={isAdmin}
						onEdit={onEditReview}
						onDelete={onDeleteReview}
					/>
				))}
			</div>

			{/* Show message if no reviews match filter */}
			{sortedReviews.length === 0 && totalReviews > 0 && (
				<Card>
					<CardContent className="p-8 text-center">
						<p className="text-muted-foreground">
							No reviews found matching your filter criteria.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
