import * as React from "react";

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
    <div className="flex justify-between pt-4">
      {step > 0 && (
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          disabled={isLoading}
        >
          Back
        </button>
      )}
      <div className="ml-auto">
        {step < stepsCount - 1 ? (
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors"
            disabled={isLoading || isNextDisabled}
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            disabled={isLoading || isSubmitDisabled}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
}
