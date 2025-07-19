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
import * as React from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
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

	const [step, setStep] = React.useState(0); // 0: Role select, 1: Details, 2: Upload, 3: Review
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

	const [isLoading, setIsLoading] = React.useState(false);
	const [serverError, setServerError] = React.useState<string | null>(null);
	const [providerCategory, setProviderCategory] = React.useState<
		ProviderCategory | undefined
	>(undefined);

	const studentIdUpload = useFileUpload({
		userId: user?.id,
		prefix: "student-id-cards",
	});
	const providerDocUpload = useFileUpload({
		userId: user?.id,
		prefix: "verification-docs",
	});

	const onSubmit: SubmitHandler<OnboardingFormValues> = async (
		data: OnboardingFormValues,
	) => {
		if (!form.formState.isValid) {
			return;
		}
		setIsLoading(true);
		setServerError(null);
		try {
			const result = await registerOnboarding(data);
			if (!result.ok) {
				if (result.status === 409) {
					setServerError(
						"This matriculation number is already registered",
					);
				} else if (result.status === 401) {
					router.push("/auth/login");
				} else {
					setServerError(
						result.error ||
							"Registration failed. Please try again later.",
					);
				}
				return;
			}
			router.push("/app");
		} catch (e) {
			setServerError("Network error");
		} finally {
			setIsLoading(false);
		}
	};

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
	}, [userType, form]);

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
				<div className="relative min-h-[200px]">
					<div
						key={step}
						className="absolute inset-0 animate-in fade-in-0 slide-in-from-bottom-4 transition-all duration-300"
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
								<div className="space-y-4">
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
												<FormItem className="space-y-1">
													<FileUploadField
														label={doc.label}
														description={
															doc.description
														}
														value={field.value}
														onFileChange={async (
															file,
														) => {
															if (!file) {
																return;
															}
															const path =
																await providerDocUpload.uploadFile(
																	file,
																);
															if (path) {
																field.onChange(
																	path,
																);
															}
														}}
														isLoading={
															providerDocUpload.isUploading
														}
														error={
															providerDocUpload.error
														}
														accept="image/jpeg,image/png,application/pdf"
														helpText="Upload a valid document (max 5MB)"
														disabled={isLoading}
													/>
													<FormMessage className="text-xs" />
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
					isSubmitDisabled={isLoading || !form.formState.isValid}
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
