import React from "react";

export interface VerificationDoc {
	id: string;
	userId: string;
	userName: string;
	userRole: string;
	documentUrl: string;
	submittedAt: string;
	status: "PENDING" | "APPROVED" | "REJECTED";
	notes?: string;
	// Extended fields for admin review
	userType?: string;
	matricNumber?: string;
	department?: string;
	level?: number;
	providerCategory?: string;
	providerVerificationDocs?: Record<string, unknown>;
	studentIdCardUrl?: string;
}

interface VerificationDocsListProps {
	docs: VerificationDoc[];
	onSelect: (doc: VerificationDoc) => void;
}

export const VerificationDocsList: React.FC<VerificationDocsListProps> = ({
	docs,
	onSelect,
}) => {
	return (
		<div className="space-y-2">
			{docs.length === 0 ? (
				<div className="text-muted-foreground">
					No pending verifications.
				</div>
			) : (
				<ul className="divide-y divide-border rounded-md border">
					{docs.map((doc) => (
						<button
							type="button"
							key={doc.id}
							className="flex w-full items-center justify-between px-4 py-3 hover:bg-accent cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-none text-left"
							onClick={() => onSelect(doc)}
						>
							<div>
								<div className="font-medium">
									{doc.userName} ({doc.userRole})
								</div>
								<div className="text-xs text-muted-foreground">
									Submitted:{" "}
									{new Date(doc.submittedAt).toLocaleString()}
								</div>
							</div>
							<div className="text-xs uppercase tracking-wide px-2 py-1 rounded bg-muted">
								{doc.status}
							</div>
						</button>
					))}
				</ul>
			)}
		</div>
	);
};
