"use client";

import { CATEGORY_VERIFICATION_REQUIREMENTS } from "@repo/api/src/lib/category-verification-requirements";
import { useSession } from "@saas/auth/hooks/use-session";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@ui/components/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { Button } from "@ui/components/button";
import { cn } from "@ui/lib";
import { AlertCircle, Save, Clock } from "lucide-react";
import * as React from "react";
import { useMemo, useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useOnboardingForm } from "../hooks/use-onboarding-form";
import { useOptimizedFileUpload } from "../hooks/use-optimized-file-upload";
import { useBackgroundSync } from "../hooks/use-background-sync";
import type {
	OnboardingFormValues,
	ProviderCategory,
} from "../onboarding-schema";
import { EnhancedFileUploadField } from "./molecules/enhanced-file-upload-field";
import { NavigationButtons } from "./molecules/navigation-buttons";
import { StepProgress } from "./molecules/step-progress";
import { StudentDetailsStep } from "./onboarding-steps/student-details-step";
import { StudentReviewStep } from "./onboarding-steps/student-review-step";
import { ProviderDetailsStep } from "./onboarding-steps/provider-details-step";
import { ProviderReviewStep } from "./onboarding-steps/provider-review-step";

interface OptimizedOnboardingFormProps {
	className?: string;
}

export function OptimizedOnboardingForm({
	className,
}: OptimizedOnboardingFormProps) {
	const { user } = useSession();

	const {
		form,
		submitOnboarding,
		isSubmitting,
		isDraftSaving,
		hasDraft,
		clearDraft,
	} = useOnboardingForm();

	// Enable background sync for better offline support
	const { isOnline } = useBackgroundSync();

	const [step, setStep] = React.useState(0);
	const [providerCategory, setProviderCategory] = React.useState<
		ProviderCategory | undefined
	>(undefined);

	const userType = form.watch("userType");

	// Step configuration
	const steps = useMemo(
		() => [
			"Select Role",
			...(userType === "STUDENT"
				? ["Student Details", "Upload Student ID", "Review & Submit"]
				: userType === "PROVIDER"
					? [
							"Provider Details",
							"Upload Documents",
							"Review & Submit",
						]
					: []),
		],
		[userType],
	);

	// File upload hooks with enhanced configuration
	const studentIdUpload = useOptimizedFileUpload({
		userId: user?.id,
		prefix: "student-id-cards",
		onProgress: (progress) => {
			// Progress is automatically handled by the enhanced component
		},
		onSuccess: (path) => {
			form.setValue("studentIdCard", path, { shouldValidate: true });
		},
		onError: (error) => {
			console.error("Student ID upload error:", error);
		},
	});

	// Create separate upload hooks for each possible provider document type
	// We need to create all possible hooks upfront to follow Rules of Hooks
	const idCardUpload = useOptimizedFileUpload({
		userId: user?.id,
		prefix: "verification-docs",
		onSuccess: (path) => {
			form.setValue("providerDocs.id_card" as any, path, {
				shouldValidate: true,
			});
		},
		onError: (error) => {
			console.error("ID card upload error:", error);
		},
	});

	const portfolioUpload = useOptimizedFileUpload({
		userId: user?.id,
		prefix: "verification-docs",
		onSuccess: (path) => {
			form.setValue("providerDocs.portfolio" as any, path, {
				shouldValidate: true,
			});
		},
		onError: (error) => {
			console.error("Portfolio upload error:", error);
		},
	});

	const certificateUpload = useOptimizedFileUpload({
		userId: user?.id,
		prefix: "verification-docs",
		onSuccess: (path) => {
			form.setValue("providerDocs.certificate" as any, path, {
				shouldValidate: true,
			});
		},
		onError: (error) => {
			console.error("Certificate upload error:", error);
		},
	});

	const licenseUpload = useOptimizedFileUpload({
		userId: user?.id,
		prefix: "verification-docs",
		onSuccess: (path) => {
			form.setValue("providerDocs.license" as any, path, {
				shouldValidate: true,
			});
		},
		onError: (error) => {
			console.error("License upload error:", error);
		},
	});

	const foodPermitUpload = useOptimizedFileUpload({
		userId: user?.id,
		prefix: "verification-docs",
		onSuccess: (path) => {
			form.setValue("providerDocs.food_permit" as any, path, {
				shouldValidate: true,
			});
		},
		onError: (error) => {
			console.error("Food permit upload error:", error);
		},
	});

	const businessRegUpload = useOptimizedFileUpload({
		userId: user?.id,
		prefix: "verification-docs",
		onSuccess: (path) => {
			form.setValue("providerDocs.business_reg" as any, path, {
				shouldValidate: true,
			});
		},
		onError: (error) => {
			console.error("Business registration upload error:", error);
		},
	});

	// Helper function to get upload hook for a specific document
	const getUploadHook = useCallback(
		(docKey: string) => {
			switch (docKey) {
				case "id_card":
					return idCardUpload;
				case "portfolio":
					return portfolioUpload;
				case "certificate":
					return certificateUpload;
				case "license":
					return licenseUpload;
				case "food_permit":
					return foodPermitUpload;
				case "business_reg":
					return businessRegUpload;
				default:
					return null;
			}
		},
		[
			idCardUpload,
			portfolioUpload,
			certificateUpload,
			licenseUpload,
			foodPermitUpload,
			businessRegUpload,
		],
	);

	// Auto-update provider category when it changes in form
	React.useEffect(() => {
		const currentCategory = form.watch("providerCategory");
		if (currentCategory && currentCategory !== providerCategory) {
			setProviderCategory(currentCategory as ProviderCategory);
		}
	}, [form.watch("providerCategory"), providerCategory]);

	// Auto-select provider category if only one exists
	React.useEffect(() => {
		if (userType === "PROVIDER") {
			const categories = Object.keys(CATEGORY_VERIFICATION_REQUIREMENTS);
			if (categories.length === 1) {
				const category = categories[0] as ProviderCategory;
				setProviderCategory(category);
				form.setValue("providerCategory", category, {
					shouldValidate: true,
				});
			}
		}
	}, [userType, form]);

	// Watch form values for proper reactivity
	const matricNumber = form.watch("matricNumber");
	const department = form.watch("department");
	const level = form.watch("level");
	const studentIdCard = form.watch("studentIdCard");
	const providerCategoryField = form.watch("providerCategory");
	const providerDocs = form.watch("providerDocs");

	// Memoized validation state to prevent unnecessary re-renders
	const validationState = useMemo(() => {
		const errors = form.formState.errors;

		return {
			hasErrors: Object.keys(errors).length > 0,
			canProceedFromStep0: !!userType,
			canProceedFromStep1:
				userType === "STUDENT"
					? !errors.matricNumber &&
						!errors.department &&
						!errors.level &&
						matricNumber &&
						department &&
						level
					: userType === "PROVIDER"
						? !errors.providerCategory && providerCategoryField
						: false,
			canProceedFromStep2:
				userType === "STUDENT"
					? !errors.studentIdCard && studentIdCard
					: userType === "PROVIDER" && providerCategory
						? CATEGORY_VERIFICATION_REQUIREMENTS[
								providerCategory
							]?.requiredDocuments.every(
								(doc) => providerDocs?.[doc.key],
							)
						: false,
			canSubmit:
				form.formState.isValid &&
				!isSubmitting &&
				!isSubmissionInProgress,
		};
	}, [
		form.formState.errors,
		form.formState.isValid,
		userType,
		matricNumber,
		department,
		level,
		studentIdCard,
		providerCategoryField,
		providerDocs,
		providerCategory,
		isSubmitting,
		isSubmissionInProgress,
	]);

	// Enhanced navigation functions
	const handleNext = useCallback(() => {
		setStep((s) => Math.min(s + 1, steps.length - 1));
	}, [steps.length]);

	const handleBack = useCallback(() => {
		setStep((s) => Math.max(s - 1, 0));
	}, []);

	// Enhanced form submission with double-submission prevention
	const [isSubmissionInProgress, setIsSubmissionInProgress] =
		React.useState(false);

	const handleSubmit = useCallback(
		async (data: OnboardingFormValues, event?: React.FormEvent) => {
			// Prevent browser default form submission
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			// Comprehensive submission guards
			if (
				!validationState.canSubmit ||
				isSubmitting ||
				isSubmissionInProgress
			) {
				console.log("Submission blocked:", {
					canSubmit: validationState.canSubmit,
					isSubmitting,
					isSubmissionInProgress,
				});
				return;
			}

			try {
				setIsSubmissionInProgress(true);
				console.log("Starting onboarding submission...", data);
				await submitOnboarding(data);
			} catch (error) {
				console.error("Submission failed:", error);
			} finally {
				setIsSubmissionInProgress(false);
			}
		},
		[
			submitOnboarding,
			validationState.canSubmit,
			isSubmitting,
			isSubmissionInProgress,
		],
	);

	// Handle role change with form reset
	const handleRoleChange = useCallback(
		(value: string) => {
			const newUserType = value as "STUDENT" | "PROVIDER";
			form.setValue("userType", newUserType);

			// Reset form fields when changing role
			form.reset({
				userType: newUserType,
				matricNumber: "",
				department: "",
				level: undefined,
				verificationDoc: "",
				studentIdCard: "",
				providerCategory: undefined,
				providerDocs: {},
			});

			setProviderCategory(undefined);
		},
		[form],
	);

	// Enhanced file upload handlers
	const handleStudentIdUpload = useCallback(
		async (file: File | null) => {
			if (!file) {
				form.setValue("studentIdCard", "", { shouldValidate: true });
				return;
			}

			try {
				const ext = file.name.split(".").pop() || "jpg";
				const customPath = `${user?.id}-student-id-card-${uuid()}.${ext}`;

				const uploadedPath = await studentIdUpload.uploadFile({
					file,
					customPath,
				});
				if (uploadedPath) {
					form.setValue("studentIdCard", uploadedPath, {
						shouldValidate: true,
					});
				}
			} catch (error) {
				console.error("Failed to upload student ID:", error);
			}
		},
		[studentIdUpload, form, user?.id],
	);

	const handleProviderDocUpload = useCallback(
		(docKey: string) => async (file: File | null) => {
			if (!file) {
				form.setValue(`providerDocs.${docKey}` as any, "", {
					shouldValidate: true,
				});
				return;
			}

			try {
				const ext = file.name.split(".").pop() || "pdf";
				const customPath = `${user?.id}-${docKey}-${uuid()}.${ext}`;

				// Get the appropriate upload hook for this document type
				const uploadHook = getUploadHook(docKey);
				if (!uploadHook) {
					console.error(
						`No upload hook found for document type: ${docKey}`,
					);
					return;
				}

				const uploadedPath = await uploadHook.uploadFile({
					file,
					customPath,
				});
				if (uploadedPath) {
					form.setValue(
						`providerDocs.${docKey}` as any,
						uploadedPath,
						{
							shouldValidate: true,
						},
					);
				}
			} catch (error) {
				console.error(`Failed to upload ${docKey}:`, error);
			}
		},
		[getUploadHook, form, user?.id],
	);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className={cn("space-y-6", className)}
			>
				{/* Draft status indicator */}
				{hasDraft && (
					<div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
						<div className="flex items-center gap-2">
							<Clock className="size-4 text-amber-600" />
							<span className="text-sm text-amber-800">
								Draft saved {isDraftSaving && "(saving...)"}
							</span>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={clearDraft}
							className="h-auto px-2 py-1 text-amber-700 hover:text-amber-900"
						>
							Clear Draft
						</Button>
					</div>
				)}

				{/* Global form error */}
				{form.formState.errors.root && (
					<div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/30 rounded px-3 py-2 text-sm shadow-sm animate-in fade-in">
						<AlertCircle className="size-4 shrink-0" />
						<span className="font-medium">
							{form.formState.errors.root.message}
						</span>
					</div>
				)}

				{/* Progress Steps */}
				<StepProgress steps={steps} currentStep={step} />

				{/* Step Content with Enhanced Transitions */}
				<div className="space-y-6 py-4">
					<div
						key={step}
						className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
					>
						{/* Step 0: Role Selection */}
						{step === 0 && (
							<FormField
								control={form.control}
								name="userType"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-lg font-semibold">
											I am a...
										</FormLabel>
										<FormControl>
											<Select
												value={field.value ?? ""}
												onValueChange={handleRoleChange}
												disabled={isSubmitting}
											>
												<SelectTrigger className="w-full h-12">
													<SelectValue placeholder="Select your role" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="STUDENT">
														🎓 Student
													</SelectItem>
													<SelectItem value="PROVIDER">
														💼 Service Provider
													</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<p className="text-sm text-muted-foreground">
											Choose your role to continue
											onboarding.
										</p>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Step 1: Details */}
						{step === 1 && userType === "STUDENT" && (
							<StudentDetailsStep
								form={form}
								isLoading={isSubmitting}
							/>
						)}

						{step === 1 && userType === "PROVIDER" && (
							<ProviderDetailsStep
								form={form}
								isLoading={isSubmitting}
								setProviderCategory={(cat: string) =>
									setProviderCategory(cat as ProviderCategory)
								}
							/>
						)}

						{/* Step 2: Document Uploads */}
						{step === 2 && userType === "STUDENT" && (
							<FormField
								control={form.control}
								name="studentIdCard"
								render={({ field }) => (
									<FormItem>
										<EnhancedFileUploadField
											label="Student ID Card"
											value={field.value || ""}
											onFileChange={handleStudentIdUpload}
											isLoading={
												studentIdUpload.isUploading
											}
											progress={studentIdUpload.progress}
											error={studentIdUpload.error}
											onRetry={studentIdUpload.reset}
											accept="image/jpeg,image/png,application/pdf"
											helpText="Upload a clear photo or scan of your UNIBEN student ID card (JPG, PNG, or PDF, max 5MB)"
											disabled={isSubmitting}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{step === 2 &&
							userType === "PROVIDER" &&
							providerCategory && (
								<div className="space-y-6">
									<h3 className="text-lg font-semibold">
										Upload Required Documents
									</h3>
									{CATEGORY_VERIFICATION_REQUIREMENTS[
										providerCategory
									]?.requiredDocuments.map((doc) => (
										<FormField
											key={doc.key}
											control={form.control}
											name={
												`providerDocs.${doc.key}` as any
											}
											render={({ field }) => (
												<FormItem>
													<EnhancedFileUploadField
														label={doc.label}
														description={
															doc.description
														}
														value={
															field.value || ""
														}
														onFileChange={handleProviderDocUpload(
															doc.key,
														)}
														isLoading={
															getUploadHook(
																doc.key,
															)?.isUploading ||
															false
														}
														progress={
															getUploadHook(
																doc.key,
															)?.progress || 0
														}
														error={
															getUploadHook(
																doc.key,
															)?.error || null
														}
														onRetry={() =>
															getUploadHook(
																doc.key,
															)?.reset()
														}
														accept="image/jpeg,image/png,application/pdf"
														helpText="Upload a valid document (JPG, PNG, or PDF, max 5MB)"
														disabled={isSubmitting}
													/>
													<FormMessage />
												</FormItem>
											)}
										/>
									))}
								</div>
							)}

						{/* Step 3: Review */}
						{step === 3 && (
							<div className="space-y-4">
								<h3 className="text-lg font-semibold">
									Review Your Information
								</h3>
								{userType === "STUDENT" ? (
									<StudentReviewStep form={form} />
								) : (
									<ProviderReviewStep
										form={form}
										providerCategory={
											providerCategory || ""
										}
										CATEGORY_VERIFICATION_REQUIREMENTS={
											CATEGORY_VERIFICATION_REQUIREMENTS
										}
									/>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Enhanced Navigation Buttons */}
				<NavigationButtons
					step={step}
					stepsCount={steps.length}
					isLoading={isSubmitting || isSubmissionInProgress}
					isNextDisabled={
						step === 0
							? !validationState.canProceedFromStep0
							: step === 1
								? !validationState.canProceedFromStep1
								: step === 2
									? !validationState.canProceedFromStep2
									: false
					}
					isSubmitDisabled={!validationState.canSubmit}
					onBack={handleBack}
					onNext={handleNext}
				/>

				{/* Auto-save indicator */}
				{isDraftSaving && (
					<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
						<Save className="size-4 animate-pulse" />
						Saving draft...
					</div>
				)}
			</form>
		</Form>
	);
}
