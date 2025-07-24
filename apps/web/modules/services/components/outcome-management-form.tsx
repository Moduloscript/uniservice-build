"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import { Textarea } from "@ui/components/textarea";
import { Plus, Edit3, Target } from "lucide-react";
import type {
	ServiceOutcome,
	CreateServiceOutcomeData,
	UpdateServiceOutcomeData,
} from "../types/service-outcome";

const outcomeFormSchema = z.object({
	title: z
		.string()
		.min(1, "Title is required")
		.max(100, "Title must be less than 100 characters"),
	description: z
		.string()
		.max(500, "Description must be less than 500 characters")
		.optional(),
	icon: z.string().default("target"),
	orderIndex: z.number().int().min(0).default(0),
	isActive: z.boolean().default(true),
});

type OutcomeFormData = z.infer<typeof outcomeFormSchema>;

interface OutcomeManagementFormProps {
	existingOutcome?: ServiceOutcome;
	onSubmit: (
		data: CreateServiceOutcomeData | UpdateServiceOutcomeData,
	) => void;
	onCancel?: () => void;
	isSubmitting?: boolean;
	className?: string;
}

export function OutcomeManagementForm({
	existingOutcome,
	onSubmit,
	onCancel,
	isSubmitting = false,
	className,
}: OutcomeManagementFormProps) {
	const isEditing = !!existingOutcome;

	const form = useForm<OutcomeFormData>({
		resolver: zodResolver(outcomeFormSchema),
		defaultValues: {
			title: existingOutcome?.title || "",
			description: existingOutcome?.description || "",
			icon: existingOutcome?.icon || "target",
			orderIndex: existingOutcome?.orderIndex || 0,
			isActive: existingOutcome?.isActive ?? true,
		},
	});

	const handleSubmit = async (data: OutcomeFormData) => {
		try {
			const submitData = {
				title: data.title,
				description: data.description || undefined,
				icon: data.icon,
				orderIndex: data.orderIndex,
				isActive: data.isActive,
			};

			await onSubmit(submitData);

			if (!isEditing) {
				form.reset();
			}
		} catch (error) {
			console.error("Failed to submit outcome:", error);
		}
	};

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{isEditing ? (
						<>
							<Edit3 className="h-5 w-5 text-primary" />
							Edit Learning Outcome
						</>
					) : (
						<>
							<Plus className="h-5 w-5 text-primary" />
							Add New Learning Outcome
						</>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-6"
					>
						{/* Title */}
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Learning Outcome Title *
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="e.g., Master advanced calculus concepts"
											maxLength={100}
										/>
									</FormControl>
									<FormDescription>
										A clear, specific learning goal students
										will achieve
									</FormDescription>
									<div className="flex justify-between text-xs text-muted-foreground">
										<FormMessage />
										<span>
											{field.value?.length || 0}/100
										</span>
									</div>
								</FormItem>
							)}
						/>

						{/* Description */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Description (Optional)
									</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Provide more details about what students will learn or achieve..."
											className="min-h-[80px] resize-none"
											maxLength={500}
										/>
									</FormControl>
									<FormDescription>
										Add specifics about skills, knowledge,
										or abilities students will gain
									</FormDescription>
									<div className="flex justify-between text-xs text-muted-foreground">
										<FormMessage />
										<span>
											{field.value?.length || 0}/500
										</span>
									</div>
								</FormItem>
							)}
						/>

						{/* Order Index */}
						<FormField
							control={form.control}
							name="orderIndex"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Display Order</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="number"
											min={0}
											onChange={(e) =>
												field.onChange(
													Number(e.target.value),
												)
											}
											placeholder="0"
										/>
									</FormControl>
									<FormDescription>
										Lower numbers appear first (0 = first
										position)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Preview */}
						{form.watch("title") && (
							<div className="bg-muted/30 border border-muted rounded-lg p-4">
								<div className="text-sm font-medium text-muted-foreground mb-2">
									Preview:
								</div>
								<div className="flex items-start gap-3">
									<Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
									<div className="flex-1">
										<div className="font-medium text-foreground">
											{form.watch("title")}
										</div>
										{form.watch("description") && (
											<div className="text-sm text-muted-foreground mt-1">
												{form.watch("description")}
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Actions */}
						<div className="flex justify-end gap-3 pt-4 border-t border-muted">
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
								disabled={
									isSubmitting || !form.formState.isValid
								}
								className="min-w-[120px]"
							>
								{isSubmitting ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
										{isEditing
											? "Updating..."
											: "Adding..."}
									</>
								) : isEditing ? (
									"Update Outcome"
								) : (
									"Add Outcome"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
