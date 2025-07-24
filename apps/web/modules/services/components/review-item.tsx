"use client";

import { useState } from "react";
import { Edit2, Trash2, User } from "lucide-react";
import { Button } from "../../ui/components/button";
import { Card, CardContent } from "../../ui/components/card";
import { Badge } from "../../ui/components/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../../ui/components/alert-dialog";
import { StarRating } from "./star-rating";
import type { Review } from "../types/review";
import { cn } from "../../ui/lib";

interface ReviewItemProps {
	review: Review;
	currentUserId?: string;
	isAdmin?: boolean;
	onEdit?: (review: Review) => void;
	onDelete?: (reviewId: string) => void;
	className?: string;
}

export function ReviewItem({
	review,
	currentUserId,
	isAdmin = false,
	onEdit,
	onDelete,
	className,
}: ReviewItemProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const canEdit = currentUserId === review.authorId;
	const canDelete = canEdit || isAdmin;

	const handleDelete = async () => {
		if (!onDelete) return;

		setIsDeleting(true);
		try {
			await onDelete(review.id);
		} catch (error) {
			console.error("Failed to delete review:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<Card className={cn("", className)}>
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
							<User className="h-5 w-5 text-muted-foreground" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="font-medium">
									{review.author.name}
								</span>
								<Badge variant="outline" className="text-xs">
									{review.author.userType}
								</Badge>
							</div>
							<div className="flex items-center gap-2 mt-1">
								<StarRating rating={review.rating} size="sm" />
								<span className="text-sm text-muted-foreground">
									{formatDate(review.createdAt)}
								</span>
							</div>
						</div>
					</div>

					{/* Action buttons */}
					<div className="flex items-center gap-1">
						{canEdit && onEdit && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onEdit(review)}
								className="h-8 w-8 p-0"
							>
								<Edit2 className="h-4 w-4" />
							</Button>
						)}

						{canDelete && onDelete && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0 text-destructive hover:text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Delete Review
										</AlertDialogTitle>
										<AlertDialogDescription>
											Are you sure you want to delete this
											review? This action cannot be
											undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction
											onClick={handleDelete}
											disabled={isDeleting}
											className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
										>
											{isDeleting
												? "Deleting..."
												: "Delete"}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>
				</div>

				{/* Review comment */}
				{review.comment && (
					<div className="mt-3">
						<p className="text-sm text-foreground leading-relaxed">
							{review.comment}
						</p>
					</div>
				)}

				{/* Review target info */}
				<div className="mt-3 pt-3 border-t">
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<span>Review for:</span>
						<span className="font-medium">
							{review.target.name}
						</span>
						<Badge variant="outline" className="text-xs">
							{review.target.userType}
						</Badge>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
