import React from "react";
import { Card, CardContent } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import {
	FileText,
	Calendar,
	User,
	GraduationCap,
	Building2,
	Hash,
	ChevronRight,
	FileCheck2,
} from "lucide-react";

export interface VerificationDoc {
	id: string;
	userId: string;
	userName: string;
	userRole: string;
	documentUrl: string;
	verificationDoc?: string; // Added for better compatibility
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

// Helper functions
const getStatusBadgeProps = (
	status: string,
): { status: "success" | "info" | "warning" | "error" } => {
	switch (status) {
		case "PENDING":
			return { status: "warning" };
		case "APPROVED":
			return { status: "success" };
		case "REJECTED":
			return { status: "error" };
		default:
			return { status: "info" };
	}
};

const getUserTypeIcon = (userType?: string) => {
	switch (userType) {
		case "STUDENT":
			return GraduationCap;
		case "PROVIDER":
			return Building2;
		default:
			return User;
	}
};

const getDocumentCount = (doc: VerificationDoc) => {
	let count = 0;
	if (doc.documentUrl) count++;
	if (doc.studentIdCardUrl) count++;
	if (doc.providerVerificationDocs) {
		count += Object.keys(doc.providerVerificationDocs).length;
	}
	return Math.max(count, 1); // At least 1 document
};

const formatTimeAgo = (dateString: string) => {
	try {
		if (!dateString) return "No date";
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return "Invalid date";

		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffHours / 24);

		if (diffHours < 1) return "Just now";
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	} catch {
		return "Invalid date";
	}
};

interface VerificationDocsListProps {
	docs: VerificationDoc[];
	onSelect: (doc: VerificationDoc) => void;
}

export const VerificationDocsList: React.FC<VerificationDocsListProps> = ({
	docs = [],
	onSelect,
}) => {
	return (
		<div className="space-y-4">
			{docs.length === 0 ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
						<FileCheck2 className="h-12 w-12 mb-4 text-gray-400" />
						<p className="font-medium text-lg mb-1">
							No pending verifications
						</p>
						<p className="text-sm">
							All documents have been reviewed
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{docs.map((doc) => {
						const docCount = getDocumentCount(doc);
						const timeAgo = formatTimeAgo(doc.submittedAt);
						const statusBadgeProps = getStatusBadgeProps(
							doc.status,
						);
						const UserTypeIcon = getUserTypeIcon(doc.userType);
						return (
							<Card
								key={doc.id}
								className="border hover:shadow-md transition-shadow duration-200 cursor-pointer"
								onClick={() => onSelect(doc)}
							>
								<CardContent className="p-6">
									<div className="flex items-start justify-between">
										{/* Left side - User info */}
										<div className="flex-1 min-w-0">
											{/* User header */}
											<div className="flex items-center gap-3 mb-3">
												<UserTypeIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
												<h3 className="font-semibold text-lg text-foreground truncate">
													{doc.userName}
												</h3>
											</div>

											{/* User details */}
											<div className="space-y-1.5 mb-3">
												{doc.userType === "STUDENT" &&
													doc.matricNumber && (
														<div className="flex items-center gap-2 text-sm text-muted-foreground">
															<Hash className="h-3.5 w-3.5 flex-shrink-0" />
															<span>
																Matric:{" "}
																{
																	doc.matricNumber
																}
															</span>
														</div>
													)}

												{doc.userType === "STUDENT" &&
													doc.department && (
														<div className="flex items-center gap-2 text-sm text-muted-foreground">
															<GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
															<span>
																{doc.department}
																{doc.level &&
																	` - Level ${doc.level}`}
															</span>
														</div>
													)}

												{doc.userType === "PROVIDER" &&
													doc.providerCategory && (
														<div className="flex items-center gap-2 text-sm text-muted-foreground">
															<Building2 className="h-3.5 w-3.5 flex-shrink-0" />
															<span>
																{
																	doc.providerCategory
																}
															</span>
														</div>
													)}
											</div>

											{/* Metadata */}
											<div className="flex items-center gap-4 text-xs text-muted-foreground">
												<div className="flex items-center gap-1.5">
													<FileText className="h-3.5 w-3.5 flex-shrink-0" />
													<span>
														{docCount} Document
														{docCount !== 1
															? "s"
															: ""}
													</span>
												</div>
												<div className="flex items-center gap-1.5">
													<Calendar className="h-3.5 w-3.5 flex-shrink-0" />
													<span>{timeAgo}</span>
												</div>
											</div>
										</div>

										{/* Right side - Status and action */}
										<div className="flex flex-col items-end gap-2 ml-4">
											<Badge
												variant="secondary"
												className="text-xs font-medium"
											>
												{doc.status}
											</Badge>
											<Button
												variant="ghost"
												size="sm"
												className="text-xs text-primary hover:text-primary-dark h-auto p-1"
											>
												<span>View</span>
												<ChevronRight className="h-3 w-3 ml-1" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
};
