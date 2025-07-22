"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { cn } from "@ui/lib";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useAtom } from 'jotai';
import { stepAtom, providerCategoryAtom, isLoadingAtom, serverErrorAtom, combinedSubmitDisabledAtom, formValidityAtom } from '../state/onboardingAtoms';
import { submitOnboardingAtom, resetSubmissionStateAtom } from '../state/onboardingSubmission';
import { v4 as uuid } from "uuid";
import { registerOnboarding } from "../api/onboarding";
import { useFileUpload } from "../hooks/use-file-upload";
import {
	type OnboardingFormValues,
	type ProviderCategory,
	onboardingSchema,
} from "../onboarding-schema";
import { FileUploadField } from "./molecules/file-upload-field";
import { NavigationButtons } from "./molecules/navigation-buttons";
import { StepProgress } from "./molecules/step-progress";
import { ProviderDetailsStep } from "./onboarding-steps/provider-details-step";
import { ProviderReviewStep } from "./onboarding-steps/provider-review-step";
import { StudentDetailsStep } from "./onboarding-steps/student-details-step";
import { StudentReviewStep } from "./onboarding-steps/student-review-step";

const providerCategories = Object.keys(CATEGORY_VERIFICATION_REQUIREMENTS);

export function OnboardingForm({ className }: { className?: string }) {
	const { user } = useSession();
	const router = useRouter();

	// Use Jotai atoms instead of React state
	const [step, setStep] = useAtom(stepAtom);
	const [providerCategory, setProviderCategory] = useAtom(providerCategoryAtom);
	const [isLoading] = useAtom(isLoadingAtom);
	const [serverError] = useAtom(serverErrorAtom);
	const [, submitOnboarding] = useAtom(submitOnboardingAtom);
	const [isSubmitDisabled] = useAtom(combinedSubmitDisabledAtom);
	const [, setFormValidity] = useAtom(formValidityAtom);
	const form = useForm<OnboardingFormValues>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			userType: undefined,
			matricNumber: "",
			department: "",
			level: undefined,
			verificationDoc: "",
			studentIdCard: "",
			providerCategory: undefined,
			providerDocs: {},
		},
		mode: "onChange",
	});

	const userType = form.watch("userType");

	const steps = [
		"Select Role",
		...(userType === "STUDENT"
			? ["Student Details", "Upload Student ID", "Review & Submit"]
			: userType === "PROVIDER"
				? ["Provider Details", "Upload Documents", "Review & Submit"]
				: []),
	];


const studentIdUpload = useFileUpload({
		userId: user?.id,
		prefix: "student-id-cards",
	});
	
	// Create individual upload hooks for provider documents
	const validIdUpload = useFileUpload({
		userId: user?.id,
		prefix: "verification-docs",
	});
	
	const portfolioUpload = useFileUpload({
		userId: user?.id,
		prefix: "verification-docs",
	});

	const onSubmit: SubmitHandler<OnboardingFormValues> = async (
		data: OnboardingFormValues,
	) => {
		// Use Jotai action atom for submission
		submitOnboarding({ data, router });
	};

	// Use Jotai atoms instead of useEffect for provider category logic
	React.useEffect(() => {
		if (userType === "PROVIDER") {
			// Select the first available provider category if only one exists
			const categories = Object.keys(CATEGORY_VERIFICATION_REQUIREMENTS);
			if (categories.length === 1) {
				setProviderCategory(categories[0] as ProviderCategory);
				form.setValue(
					"providerCategory",
					categories[0] as ProviderCategory,
					{
						shouldValidate: true,
					},
				);
			}
		}
	}, [userType, form, setProviderCategory]);

	// Sync form validity with Jotai atom
	React.useEffect(() => {
		setFormValidity(form.formState.isValid);
	}, [form.formState.isValid, setFormValidity]);

	const categoryRequirements =
		providerCategory &&
		CATEGORY_VERIFICATION_REQUIREMENTS[providerCategory];

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn("space-y-6", className)}
			>
				{serverError && (
					<div
						className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/30 rounded px-3 py-2 text-sm mt-2 shadow-sm animate-in fade-in"
						role="alert"
						aria-live="assertive"
						tabIndex={-1}
					>
						<AlertCircle
							className="size-4 shrink-0"
							aria-hidden="true"
						/>
						<span className="font-medium">{serverError}</span>
					</div>
				)}

				{/* Progress Steps */}
				<StepProgress steps={steps} currentStep={step} />

				{/* Step Content with Transition */}
				<div className="relative min-h-[400px] bg-gray-50/50 rounded-lg p-6">
					<div
						key={step}
						className="absolute inset-6 animate-in fade-in-0 slide-in-from-bottom-4 transition-all duration-300"
					>
						{/* Step 0: Role Selection */}
						{step === 0 && (
							<FormField
								control={form.control}
								name="userType"
								render={({ field }) => (
									<FormItem className="space-y-1">
										<FormLabel>I am a...</FormLabel>
										<FormControl>
											<Select
												value={field.value ?? ""}
												onValueChange={(value) => {
													field.onChange(value);
													// Reset all other fields when role changes
													form.reset({
														userType: value as
															| "STUDENT"
															| "PROVIDER",
														matricNumber: "",
														department: "",
														level: undefined,
														verificationDoc: "",
														studentIdCard: "",
														providerCategory:
															undefined,
														providerDocs: {},
													});
												}}
												disabled={isLoading}
												aria-invalid={
													!!form.formState.errors
														.userType
												}
												aria-describedby="userType-help userType-error"
											>
												<SelectTrigger className="w-full">
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
										<p
											id="userType-help"
											className="text-xs text-muted-foreground"
										>
											Choose your role to continue
											onboarding.
										</p>
										<FormMessage
											id="userType-error"
											className="text-xs"
										/>
									</FormItem>
								)}
							/>
						)}
						{/* Step 1: Details */}
						{step === 1 && userType === "STUDENT" && (
							<StudentDetailsStep
								form={form}
								isLoading={isLoading}
							/>
						)}
						{step === 1 && userType === "PROVIDER" && (
							<ProviderDetailsStep
								form={form}
								isLoading={isLoading}
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
									<FormItem className="space-y-1">
										<FileUploadField
											label="Student ID Card"
											description={undefined}
											value={field.value || ""}
											onFileChange={async (file) => {
												if (!file) {
													return;
												}
const path =
													await studentIdUpload.uploadFile(
														file,
														`${user?.id}-student-id-card-${uuid()}.${file.name.split(".").pop() || "jpg"}`,
													);
												if (path) {
													field.onChange(path);
												}
											}}
											isLoading={
												studentIdUpload.isUploading
											}
											error={studentIdUpload.error}
											accept="image/jpeg,image/png,application/pdf"
											helpText="Upload a clear photo or scan of your UNIBEN student ID card (image or PDF, max 5MB)"
											disabled={isLoading}
										/>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
						)}
						{step === 2 &&
							userType === "PROVIDER" &&
							providerCategory && (
								<div className="space-y-6">
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
										<h3 className="text-sm font-medium text-blue-900 mb-2">
											Upload Required Documents
										</h3>
										<p className="text-xs text-blue-700">
											Please upload all required documents to complete your provider registration.
										</p>
									</div>
									{CATEGORY_VERIFICATION_REQUIREMENTS[
										providerCategory
									]?.requiredDocuments.map((doc, index) => {
										// Use the appropriate upload hook based on document type
										const currentUpload = doc.key === 'validId' ? validIdUpload : portfolioUpload;
										return (
											<FormField
												key={doc.key}
												control={form.control}
												name={
													`providerDocs.${doc.key}` as any
												}
												render={({ field }) => (
													<FormItem className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
														<div className="flex items-center gap-3 mb-3">
															<div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
																{index + 1}
															</div>
															<h4 className="font-semibold text-gray-900 text-sm">{doc.label}</h4>
														</div>
														<FileUploadField
															label={""}
															description={doc.description}
															value={field.value || ""}
															onFileChange={async (file) => {
																if (!file) {
																	return;
																}
																
																const path = await currentUpload.uploadFile(
																	file,
																	`${user?.id}-${doc.key}-${uuid()}.${file.name.split(".").pop() || "pdf"}`
																);
																if (path) {
																	field.onChange(path);
																}
															}}
															isLoading={currentUpload.isUploading}
															error={currentUpload.error}
															accept="image/jpeg,image/png,application/pdf"
															helpText="Upload a clear photo or scan of your document (image or PDF, max 5MB)"
															disabled={isLoading}
														/>
														<FormMessage className="text-xs mt-2" />
													</FormItem>
												)}
											/>
										);
									})}
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

				{/* Navigation Buttons */}
				<NavigationButtons
					step={step}
					stepsCount={steps.length}
					isLoading={isLoading}
					isNextDisabled={
						step === 0
							? !userType
							: step === 1
								? !!form.formState.errors.matricNumber ||
									!!form.formState.errors.department ||
									!!form.formState.errors.level
								: false
					}
					isSubmitDisabled={isSubmitDisabled}
					onBack={() => setStep((s) => Math.max(s - 1, 0))}
					onNext={() =>
						setStep((s) => Math.min(s + 1, steps.length - 1))
					}
					aria-label="Onboarding navigation buttons"
				/>
			</form>
		</Form>
	);
}
