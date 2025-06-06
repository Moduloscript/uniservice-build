import React, { useState } from "react";
import type { VerificationDoc } from "./VerificationDocsList";

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
		<div className="space-y-2">
			<textarea
				className="w-full border rounded p-2 text-sm"
				placeholder="Add notes (optional)"
				value={notes}
				onChange={(e) => setNotes(e.target.value)}
				rows={2}
			/>
			<div className="flex gap-2">
				<button
					type="button"
					className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
					onClick={() => onApprove(doc.id, notes)}
					disabled={loading}
					data-testid="approve-button"
				>
					{loading && <span className="spinner">⏳</span>}
					Approve
				</button>
				<button
					type="button"
					className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
					onClick={() => onReject(doc.id, notes)}
					disabled={loading}
					data-testid="reject-button"
				>
					{loading && <span className="spinner">⏳</span>}
					Reject
				</button>
			</div>
		</div>
	);
};
