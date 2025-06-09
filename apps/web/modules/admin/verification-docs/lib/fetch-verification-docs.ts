import type { VerificationDoc } from "../types";

export async function fetchVerificationDocs(params: {
	status?: string | null;
	userType?: string | null;
	search?: string | null;
	sort?: string | null;
	page?: number;
}) {
	try {
		// TODO: Replace with actual API call
		const response = await fetch(
			`/api/admin/verification-docs?${new URLSearchParams(params as any)}`,
		);
		if (!response.ok) {
			throw new Error("Failed to fetch verification documents");
		}
		return (await response.json()) as {
			docs: VerificationDoc[];
			totalPages: number;
			currentPage: number;
		};
	} catch (error) {
		throw new Error("Failed to load verification documents");
	}
}
