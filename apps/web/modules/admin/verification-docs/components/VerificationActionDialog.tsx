"use client";

import { Alert, AlertDescription } from "@ui/components/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@ui/components/alert-dialog";
import { Button } from "@ui/components/button";
import { Textarea } from "@ui/components/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

interface VerificationActionDialogProps {
	action: "approve" | "reject";
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (notes?: string) => Promise<void>;
	userName: string;
	docType: string;
	isLoading?: boolean;
	error?: string | null;
	isBulkAction?: boolean;
}

export function VerificationActionDialog({
	action,
	isOpen,
	onClose,
	onConfirm,
	userName,
	docType,
	isLoading = false,
	error = null,
	isBulkAction,
}: VerificationActionDialogProps) {
	const [notes, setNotes] = useState("");

	const handleConfirm = useCallback(async () => {
		await onConfirm(notes);
		setNotes("");
	}, [onConfirm, notes]);

	const handleClose = () => {
		setNotes("");
		onClose();
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={handleClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{action === "approve" ? "Approve" : "Reject"}{" "}
						{isBulkAction ? "Documents" : "Document"}
					</AlertDialogTitle>
					<AlertDialogDescription className="space-y-3">
						<p>
							Are you sure you want to{" "}
							{action === "approve" ? "approve" : "reject"}{" "}
							{isBulkAction ? (
								<span>these {userName}?</span>
							) : (
								<span>
									the verification document for{" "}
									<strong>{userName}</strong> ({docType})?
								</span>
							)}
						</p>
						{action === "reject" && (
							<div className="space-y-2">
								<p className="text-sm font-medium">
									Add notes (optional):
								</p>
								<Textarea
									placeholder="Enter reason for rejection..."
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									className="h-24"
								/>
							</div>
						)}{" "}
						{error && (
							<Alert variant="error">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						asChild
						onClick={(e) => {
							e.preventDefault();
							void handleConfirm();
						}}
					>
						{" "}
						<Button
							variant={action === "approve" ? "primary" : "error"}
							disabled={isLoading}
							className="min-w-[80px]"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{action === "approve"
										? "Approving..."
										: "Rejecting..."}
								</>
							) : action === "approve" ? (
								"Approve"
							) : (
								"Reject"
							)}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
