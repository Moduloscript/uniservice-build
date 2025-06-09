export interface VerificationDoc {
	id: string;
	userName: string;
	userType: "STUDENT" | "PROVIDER";
	status: VerificationStatus;
	documentUrl?: string;
	submittedAt: string;
	metadata: {
		matricNumber?: string;
		department?: string;
		level?: number;
		providerCategory?: string;
		[key: string]: unknown;
	};
}

export interface VerificationStatus {
	state: "PENDING" | "APPROVED" | "REJECTED" | "INCOMPLETE";
	updatedAt: string;
	updatedBy?: string;
}

export const STATUS_COLORS = {
	PENDING: "bg-yellow-500",
	APPROVED: "bg-green-500",
	REJECTED: "bg-red-500",
	INCOMPLETE: "bg-gray-500",
} as const;
