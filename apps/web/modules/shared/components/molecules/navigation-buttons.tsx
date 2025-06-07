import * as React from "react";
import { Spinner } from "../Spinner";

export interface NavigationButtonsProps {
	step: number;
	stepsCount: number;
	isLoading?: boolean;
	isNextDisabled?: boolean;
	isSubmitDisabled?: boolean;
	onBack: () => void;
	onNext: () => void;
}

export function NavigationButtons({
	step,
	stepsCount,
	isLoading,
	isNextDisabled,
	isSubmitDisabled,
	onBack,
	onNext,
}: NavigationButtonsProps) {
	return (
		<div
			className="flex justify-between pt-4"
			aria-label="Onboarding navigation buttons"
		>
			{step > 0 && (
				<button
					type="button"
					onClick={onBack}
					className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					disabled={isLoading}
					aria-label="Go to previous step"
					tabIndex={0}
				>
					Back
				</button>
			)}
			<div className="ml-auto">
				{step < stepsCount - 1 ? (
					<button
						type="button"
						onClick={onNext}
						className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
						disabled={isLoading || isNextDisabled}
						aria-label="Go to next step"
						tabIndex={0}
					>
						{isLoading ? <Spinner className="size-4 mr-2" /> : null}
						Next
					</button>
				) : (
					<button
						type="submit"
						className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
						disabled={isLoading || isSubmitDisabled}
						aria-label="Submit onboarding form"
						tabIndex={0}
					>
						{isLoading ? <Spinner className="size-4 mr-2" /> : null}
						{isLoading ? "Submitting..." : "Submit"}
					</button>
				)}
			</div>
		</div>
	);
}
