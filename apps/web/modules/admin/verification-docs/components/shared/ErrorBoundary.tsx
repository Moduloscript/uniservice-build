"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorBoundaryProps {
	error: Error;
	reset: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
	return (
		<Alert variant="destructive" className="mb-4">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>Error Loading Documents</AlertTitle>
			<AlertDescription className="flex items-center justify-between">
				<span>
					{error.message ||
						"Something went wrong while loading the documents."}
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={reset}
					className="mt-2"
				>
					Try Again
				</Button>
			</AlertDescription>
		</Alert>
	);
}
