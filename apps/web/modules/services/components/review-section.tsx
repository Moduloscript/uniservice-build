"use client";

import { useState, useEffect } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "../../ui/components/button";
import {
	Card,
	CardContent,
} from "../../ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../ui/components/dialog";
import { toast } from "sonner";
import { ReviewList } from "./review-list";
import { ReviewForm } from "./review-form";
import {
	fetchReviewsForService,
	submitReview,
	updateReview,
	deleteReview,
} from "../api";
import type { Review, CreateReviewData, UpdateReviewData } from "../types/review";
import { formatErrorMessage } from "../utils/error-formatting";

interface ReviewSectionProps {
	serviceId: string;
	currentUserId?: string;
	userRole?: string;
	initialReviews?: Review[];
	userBookings?: Array<{
		id: string;
		serviceId: string;
		status: string;
		hasReview: boolean;
	}>;
}

export function ReviewSection({
	serviceId,
	currentUserId,
	userRole,
	initialReviews = [],
	userBookings = [],
}: ReviewSectionProps) {
	const [reviews, setReviews] = useState<Review[]>(initialReviews);
	const [loading, setLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showReviewForm, setShowReviewForm] = useState(false);
	const [editingReview, setEditingReview] = useState<Review | null>(null);

	const isAdmin = userRole === "admin";

	// Get available bookings for review (completed bookings without reviews)
	const availableBookingsForReview = userBookings.filter(
		(booking) => booking.status === "COMPLETED" && !booking.hasReview,
	);

	// Load reviews on component mount
	useEffect(() => {
		if (initialReviews.length === 0) {
			loadReviews();
		}
	}, [serviceId, initialReviews.length]);

	const loadReviews = async () => {
		setLoading(true);
		try {
			const fetchedReviews = await fetchReviewsForService(serviceId);
			setReviews(fetchedReviews);
		} catch (error) {
			console.error("Failed to load reviews:", error);
			toast.error("Failed to load reviews. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmitReview = async (
		data: CreateReviewData | UpdateReviewData,
	) => {
		setIsSubmitting(true);
		try {
			if (editingReview) {
				// Update existing review
				const updatedReview = await updateReview(
					editingReview.id,
					data as UpdateReviewData,
				);
				setReviews((prev) =>
					prev.map((review) =>
						review.id === editingReview.id ? updatedReview : review,
					),
				);
				toast.success("Review updated successfully!");
				setEditingReview(null);
			} else {
				// Create new review
				const newReview = await submitReview(data as CreateReviewData);
				setReviews((prev) => [newReview, ...prev]);
				toast.success("Review submitted successfully!");
			}
			setShowReviewForm(false);
		} catch (error) {
			console.error("Failed to submit review:", error);
			toast.error(
				formatErrorMessage(
					error,
					"Failed to submit review. Please try again.",
				),
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditReview = (review: Review) => {
		setEditingReview(review);
		setShowReviewForm(true);
	};

	const handleDeleteReview = async (reviewId: string) => {
		try {
			await deleteReview(reviewId);
			setReviews((prev) =>
				prev.filter((review) => review.id !== reviewId),
			);
			toast.success("Review deleted successfully!");
		} catch (error) {
			console.error("Failed to delete review:", error);
			toast.error(
				formatErrorMessage(
					error,
					"Failed to delete review. Please try again.",
				),
			);
		}
	};

	const handleCancelForm = () => {
		setShowReviewForm(false);
		setEditingReview(null);
	};

	return (
		<div className="space-y-6">
			{/* Header with Add Review Button */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Reviews</h2>
					<p className="text-muted-foreground">
						See what others are saying about this service
					</p>
				</div>

				{/* Add Review Button - Only show if user has completed bookings without reviews */}
				{currentUserId && availableBookingsForReview.length > 0 && (
					<Dialog
						open={showReviewForm}
						onOpenChange={setShowReviewForm}
					>
						<DialogTrigger asChild>
							<Button className="gap-2">
								<Plus className="h-4 w-4" />
								Write Review
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>
									{editingReview
										? "Edit Review"
										: "Write a Review"}
								</DialogTitle>
							</DialogHeader>
							<ReviewForm
								bookingId={
									editingReview
										? undefined
										: availableBookingsForReview[0]?.id
								}
								existingReview={editingReview || undefined}
								onSubmit={handleSubmitReview}
								onCancel={handleCancelForm}
								isSubmitting={isSubmitting}
							/>
						</DialogContent>
					</Dialog>
				)}
			</div>

			{/* Reviews List */}
			{loading ? (
				<Card>
					<CardContent className="p-8 text-center">
						<div className="flex items-center justify-center gap-2">
							<div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
							<span>Loading reviews...</span>
						</div>
					</CardContent>
				</Card>
			) : (
				<ReviewList
					reviews={reviews}
					currentUserId={currentUserId}
					isAdmin={isAdmin}
					onEditReview={handleEditReview}
					onDeleteReview={handleDeleteReview}
				/>
			)}

			{/* No booking message */}
			{currentUserId && availableBookingsForReview.length === 0 && (
				<Card>
					<CardContent className="p-6 text-center">
						<div className="flex flex-col items-center gap-3">
							<MessageSquare className="h-8 w-8 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">
									Complete a booking to leave a review
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
