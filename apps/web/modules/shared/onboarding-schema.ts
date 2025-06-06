import { CATEGORY_VERIFICATION_REQUIREMENTS } from "@repo/api/src/lib/category-verification-requirements";
import { JsonValueSchema } from "@repo/database/src/zod";
import { z } from "zod";

const matricNumberPattern = /^U\d{4}\/\d{7}$/;

const ProviderCategoryEnum = z.enum(
	Object.keys(CATEGORY_VERIFICATION_REQUIREMENTS) as [string, ...string[]],
);

export const onboardingSchema = z
	.object({
		userType: z.enum(["STUDENT", "PROVIDER"], {
			errorMap: () => ({ message: "Please select a user type" }),
		}),
		matricNumber: z.string().optional(),
		department: z.string().optional(),
		level: z.coerce.number().int().min(100).max(700).optional(),
		verificationDoc: z.string().optional(),
		studentIdCard: z.string().optional(),
		providerCategory: ProviderCategoryEnum.optional(),
		providerDocs: JsonValueSchema.optional(),
	})
	.superRefine((data, ctx) => {
		if (data.userType === "STUDENT") {
			if (!data.matricNumber) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Matric number is required for students",
					path: ["matricNumber"],
				});
			} else if (!matricNumberPattern.test(data.matricNumber)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Matric number must be in format UYYYY/XXXXXXX",
					path: ["matricNumber"],
				});
			}
			if (!data.department) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Department is required for students",
					path: ["department"],
				});
			}
			if (!data.level) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Level is required for students (100-700)",
					path: ["level"],
				});
			}
			if (!data.studentIdCard) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Student ID card upload is required",
					path: ["studentIdCard"],
				});
			}
		}

		if (data.userType === "PROVIDER") {
			if (!data.providerCategory) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Provider category is required",
					path: ["providerCategory"],
				});
			}
			const requiredDocs = data.providerCategory
				? CATEGORY_VERIFICATION_REQUIREMENTS[data.providerCategory]
						?.requiredDocuments || []
				: [];
			requiredDocs.forEach((doc) => {
				const docs = data.providerDocs;
				if (
					!docs ||
					typeof docs !== "object" ||
					Array.isArray(docs) ||
					!(doc.key in docs) ||
					!docs[doc.key]
				) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `${doc.label} is required`,
						path: ["providerDocs", doc.key],
					});
				}
			});
		}
	});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
export type ProviderCategory = z.infer<typeof ProviderCategoryEnum>;
