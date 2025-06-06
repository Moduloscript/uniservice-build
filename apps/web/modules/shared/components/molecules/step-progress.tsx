import * as React from "react";
import { cn } from "@ui/lib";

export interface StepProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={cn("flex justify-between mb-6", className)}>
      {steps.map((title, idx) => (
        <div key={idx} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border",
              currentStep === idx
                ? "bg-primary text-primary-foreground border-primary"
                : currentStep > idx
                ? "bg-primary/20 border-primary/20"
                : "bg-muted border-muted-foreground/20"
            )}
            title={title}
          >
            {currentStep > idx ? "✓" : idx + 1}
          </div>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                "w-24 h-0.5 mx-2",
                currentStep > idx ? "bg-primary/20" : "bg-muted-foreground/20"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
