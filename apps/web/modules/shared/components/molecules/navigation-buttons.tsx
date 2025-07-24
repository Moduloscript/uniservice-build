import * as React from "react";
import { Button } from "@ui/components/button";
import { Spinner } from "../Spinner";
import { cn } from "@ui/lib";

export interface NavigationButtonsProps {
	step: number;
	stepsCount: number;
	isLoading?: boolean;
	isNextDisabled?: boolean;
	isSubmitDisabled?: boolean;
	onBack: () => void;
	onNext: () => void;
	className?: string;
}

export function NavigationButtons({
	step,
	stepsCount,
	isLoading,
	isNextDisabled,
	isSubmitDisabled,
	onBack,
	onNext,
	className,
}: NavigationButtonsProps) {
	// Check if this is the final step (review step)
	const isFinalStep = step === stepsCount - 1;

	// Clean layout without background colors and borders
	return (
		<div
			className={cn(
				"flex items-center gap-4 pt-6 mt-6",
				isFinalStep ? "justify-center" : "justify-between",
				className,
			)}
			aria-label="Navigation buttons"
		>
			{/* Back Button - Always show if not on first step */}
			{step > 0 && (
				<Button
					type="button"
					variant="outline"
					onClick={onBack}
					disabled={isLoading}
					aria-label="Go to previous step"
					className="px-6 py-2.5 h-10"
				>
					Back
				</Button>
			)}

			{/* Spacer for non-final steps when back button is not shown */}
			{step === 0 && !isFinalStep && <div />}

			{/* Next/Submit Button */}
			{isFinalStep ? (
				<Button
					type="submit"
					disabled={isLoading || isSubmitDisabled}
					aria-label="Submit onboarding form"
					className="px-8 py-2.5 h-10 min-w-[140px]"
				>
					{isLoading && <Spinner className="size-4 mr-2" />}
					{isLoading ? "Submitting..." : "Submit"}
				</Button>
			) : (
				<Button
					type="button"
					onClick={onNext}
					disabled={isLoading || isNextDisabled}
					aria-label="Go to next step"
					className="px-6 py-2.5 h-10 min-w-[100px]"
				>
					{isLoading && <Spinner className="size-4 mr-2" />}
					Next
				</Button>
			)}
		</div>
	);
}
