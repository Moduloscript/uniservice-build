"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../ui/components/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../ui/components/form";
import { Textarea } from "../../ui/components/textarea";
import { StarRating } from "./star-rating";
import type { CreateReviewData, UpdateReviewData, Review } from "../types/review";
import { MessageSquare } from "lucide-react";

const reviewSchema = z.object({
	rating: z
		.number()
		.min(1, "Rating is required")
		.max(5, "Rating must be between 1 and 5"),
	comment: z
		.string()
		.max(500, "Comment must be less than 500 characters")
		.optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
	bookingId?: string;
	existingReview?: Review;
	onSubmit: (data: CreateReviewData | UpdateReviewData) => Promise<void>;
	onCancel?: () => void;
	isSubmitting?: boolean;
	className?: string;
}

export function ReviewForm({
	bookingId,
	existingReview,
	onSubmit,
	onCancel,
	isSubmitting = false,
	className,
}: ReviewFormProps) {
	const [rating, setRating] = useState(existingReview?.rating || 0);
	const isEditing = !!existingReview;

	const form = useForm<ReviewFormData>({
		resolver: zodResolver(reviewSchema),
		defaultValues: {
			rating: existingReview?.rating || 0,
			comment: existingReview?.comment || "",
		},
	});

	const handleSubmit = async (data: ReviewFormData) => {
		try {
			if (isEditing) {
				await onSubmit({
					rating: data.rating,
					comment: data.comment,
				});
			} else {
				if (!bookingId) {
					throw new Error("Booking ID is required for new reviews");
				}
				await onSubmit({
					rating: data.rating,
					comment: data.comment,
					bookingId,
				});
			}
		} catch (error) {
			console.error("Failed to submit review:", error);
		}
	};

	const handleRatingChange = (newRating: number) => {
		setRating(newRating);
		form.setValue("rating", newRating);
	};

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MessageSquare className="h-5 w-5" />
					{isEditing ? "Edit Review" : "Write a Review"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						{/* Rating */}
						<FormField
							control={form.control}
							name="rating"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Rating *</FormLabel>
									<FormControl>
										<div className="flex items-center gap-2">
											<StarRating
												rating={rating}
												interactive
												onChange={handleRatingChange}
												size="lg"
											/>
											<span className="text-sm text-muted-foreground">
												{rating > 0
													? `${rating}/5`
													: "Select a rating"}
											</span>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Comment */}
						<FormField
							control={form.control}
							name="comment"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Comment (Optional)</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Share your experience..."
											className="min-h-[100px] resize-none"
											maxLength={500}
										/>
									</FormControl>
									<div className="flex justify-between text-xs text-muted-foreground">
										<FormMessage />
										<span>
											{field.value?.length || 0}/500
										</span>
									</div>
								</FormItem>
							)}
						/>

						{/* Actions */}
						<div className="flex justify-end gap-2 pt-4">
							{onCancel && (
								<Button
									type="button"
									variant="outline"
									onClick={onCancel}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
							)}
							<Button
								type="submit"
								disabled={isSubmitting || rating === 0}
								className="min-w-[100px]"
							>
								{isSubmitting
									? "Submitting..."
									: isEditing
										? "Update"
										: "Submit"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
