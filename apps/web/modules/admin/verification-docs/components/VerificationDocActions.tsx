import React, { useState } from "react";
import type { VerificationDoc } from "./VerificationDocsList";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Label } from "@ui/components/label";
import { Separator } from "@ui/components/separator";
import {
	CheckCircle,
	XCircle,
	Clock,
	MessageSquare,
	Loader2,
} from "lucide-react";

interface VerificationDocActionsProps {
	doc: VerificationDoc;
	onApprove: (docId: string, notes?: string) => Promise<void>;
	onReject: (docId: string, notes?: string) => Promise<void>;
	loading?: boolean;
}

export const VerificationDocActions: React.FC<VerificationDocActionsProps> = ({
	doc,
	onApprove,
	onReject,
	loading,
}) => {
	const [notes, setNotes] = useState("");

	return (
		<Card>
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2">
					<MessageSquare className="h-5 w-5" />
					Review Actions
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-3">
					<Label htmlFor="notes" className="text-sm font-medium">
						Review Notes (Optional)
					</Label>
					<textarea
						id="notes"
						className="flex min-h-[100px] w-full rounded-md border border-input bg-card px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
						placeholder="Add notes or feedback for the user..."
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						rows={4}
					/>
				</div>

				<Separator />

				<div className="flex flex-col gap-3 sm:gap-4">
					{/* Primary Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
						<Button
							variant="success"
							size="mobile"
							onClick={() => onApprove(doc.id, notes)}
							disabled={loading}
							className="flex-1 font-semibold text-white shadow-lg active:scale-[0.98] transition-transform"
							data-testid="approve-button"
						>
							{loading ? (
								<Loader2 className="h-5 w-5 animate-spin mr-2" />
							) : (
								<CheckCircle className="h-5 w-5 mr-2" />
							)}
							Approve Document
						</Button>

						<Button
							variant="error"
							size="mobile"
							onClick={() => onReject(doc.id, notes)}
							disabled={loading}
							className="flex-1 font-semibold text-white shadow-lg active:scale-[0.98] transition-transform"
							data-testid="reject-button"
						>
							{loading ? (
								<Loader2 className="h-5 w-5 animate-spin mr-2" />
							) : (
								<XCircle className="h-5 w-5 mr-2" />
							)}
							Reject Document
						</Button>
					</div>

					{/* Secondary Action */}
					<Button
						variant="outline"
						size="mobile"
						onClick={() => {
							// For now, just close the selection - could be enhanced to save as "for later review"
							window.location.reload();
						}}
						disabled={loading}
						className="w-full font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
					>
						<Clock className="h-5 w-5 mr-2" />
						Review Later
					</Button>
				</div>

				<div className="bg-muted/50 p-4 rounded-lg">
					<p className="text-xs text-muted-foreground flex items-start gap-2">
						<MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
						<span>
							Add specific feedback to help users understand any
							issues with their documents. Notes will be sent to
							the user upon approval or rejection.
						</span>
					</p>
				</div>
			</CardContent>
		</Card>
	);
};
