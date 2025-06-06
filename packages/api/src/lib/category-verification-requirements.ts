// Category-specific provider verification requirements
// Add or update categories and their required documents as needed

export interface CategoryVerificationRequirement {
	label: string;
	requiredDocuments: Array<{
		key: string;
		label: string;
		description?: string;
	}>;
}

export const CATEGORY_VERIFICATION_REQUIREMENTS: Record<
	string,
	CategoryVerificationRequirement
> = {
	"Academic Services": {
		label: "Academic Services",
		requiredDocuments: [
			{
				key: "id_card",
				label: "Valid ID Card",
				description: "Government or university-issued ID.",
			},
			{
				key: "certificate",
				label: "Academic Certificate (optional)",
				description: "Upload if you have a relevant certificate.",
			},
		],
	},
	"Food & Delivery": {
		label: "Food & Delivery",
		requiredDocuments: [
			{ key: "id_card", label: "Valid ID Card" },
			{
				key: "food_permit",
				label: "Food Handler's Permit",
				description: "Required for food preparation/delivery.",
			},
			{ key: "business_reg", label: "Business Registration (optional)" },
		],
	},
	"Tech Support": {
		label: "Tech Support",
		requiredDocuments: [
			{ key: "id_card", label: "Valid ID Card" },
			{
				key: "portfolio",
				label: "Portfolio or Certificate",
				description: "Upload a portfolio or tech certificate.",
			},
		],
	},
	"Beauty & Wellness": {
		label: "Beauty & Wellness",
		requiredDocuments: [
			{ key: "id_card", label: "Valid ID Card" },
			{ key: "license", label: "Professional License (if applicable)" },
		],
	},
	"Event Services": {
		label: "Event Services",
		requiredDocuments: [
			{ key: "id_card", label: "Valid ID Card" },
			{ key: "portfolio", label: "Portfolio (optional)" },
		],
	},
	"Personal Services": {
		label: "Personal Services",
		requiredDocuments: [{ key: "id_card", label: "Valid ID Card" }],
	},
};
