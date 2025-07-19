import React, { useState } from "react";
import type { VerificationDoc } from "./VerificationDocsList";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Label } from "@ui/components/label";
import { Separator } from "@ui/components/separator";
import { CheckCircle, XCircle, Clock, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@ui/lib";

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
				
				<div className="flex flex-col sm:flex-row gap-4">
					<Button
						variant="primary"
						size="lg"
						onClick={() => onApprove(doc.id, notes)}
						disabled={loading}
						className="flex-1 bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 h-12"
						data-testid="approve-button"
					>
						{loading ? (
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
						) : (
							<CheckCircle className="h-4 w-4 mr-2" />
						)}
						Approve Document
					</Button>
					
					<Button
						variant="error"
						size="lg"
						onClick={() => onReject(doc.id, notes)}
						disabled={loading}
						className="flex-1 h-12"
						data-testid="reject-button"
					>
						{loading ? (
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
						) : (
							<XCircle className="h-4 w-4 mr-2" />
						)}
						Reject Document
					</Button>
					
					<Button
						variant="outline"
						size="lg"
						onClick={() => {
							// For now, just close the selection - could be enhanced to save as "for later review"
							window.location.reload();
						}}
						disabled={loading}
						className="flex-1 h-12"
					>
						<Clock className="h-4 w-4 mr-2" />
						Review Later
					</Button>
				</div>
				
				<div className="bg-muted/50 p-4 rounded-lg">
					<p className="text-xs text-muted-foreground flex items-start gap-2">
						<MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
						<span>Add specific feedback to help users understand any issues with their documents. Notes will be sent to the user upon approval or rejection.</span>
					</p>
				</div>
			</CardContent>
		</Card>
	);
};
