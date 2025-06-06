import { getSession } from "@repo/auth/lib/server";
import { db } from "@repo/database";
import { Hono } from "hono";
import { validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { CATEGORY_VERIFICATION_REQUIREMENTS } from "../lib/category-verification-requirements";
import { authMiddleware } from "../middleware/auth";

// Define the matric number regex pattern
const matricNumberPattern = /^U\d{4}\/\d{7}$/;

const onboardingSchema = z
	.object({
		userType: z.enum(["STUDENT", "PROVIDER"]),
		matricNumber: z.string().optional(),
		department: z.string().optional(),
		level: z.coerce.number().optional(),
		verificationDoc: z.string().optional(),
		studentIdCard: z.string().optional(),
		providerCategory: z.string().optional(),
		providerDocs: z.record(z.string()).optional(),
	})
	.superRefine((data, ctx) => {
		if (data.userType === "STUDENT") {
			if (!data.matricNumber) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "matricNumber is required for students.",
					path: ["matricNumber"],
				});
			} else if (!matricNumberPattern.test(data.matricNumber)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "matricNumber must match format UYYYY/XXXXXXX.",
					path: ["matricNumber"],
				});
			}
			if (!data.department) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "department is required for students.",
					path: ["department"],
				});
			}
			if (
				data.level === undefined ||
				data.level === null ||
				Number.isNaN(data.level)
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "level is required for students.",
					path: ["level"],
				});
			}
			if (
				!data.studentIdCard ||
				typeof data.studentIdCard !== "string" ||
				!data.studentIdCard.trim()
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "studentIdCard is required for students.",
					path: ["studentIdCard"],
				});
			}
		}
		if (data.userType === "PROVIDER") {
			if (!data.providerCategory) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "providerCategory is required for providers.",
					path: ["providerCategory"],
				});
			}
			if (!data.providerDocs) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "providerDocs is required for providers.",
					path: ["providerDocs"],
				});
			}
		}
	});

export const onboardingRouter = new Hono()
	.use(authMiddleware)
	.post(
		"/onboarding/register",
		validator("json", onboardingSchema),
		async (c) => {
			const session = await getSession();
			if (!session) {
				throw new HTTPException(401, { message: "Unauthorized" });
			}

			const data = c.req.valid("json");

			// For students, check if the matric number is already registered
			if (data.userType === "STUDENT" && data.matricNumber) {
				const existing = await db.user.findUnique({
					where: { matricNumber: data.matricNumber },
				});
				if (existing) {
					return c.json(
						{
							error: "This matriculation number is already registered",
						},
						409,
					);
				}
			}

			// For providers, validate category and required documents
			if (data.userType === "PROVIDER" && data.providerCategory) {
				const category = data.providerCategory;
				const docs = data.providerDocs || {};

				// Validate that the category exists
				if (!CATEGORY_VERIFICATION_REQUIREMENTS[category]) {
					return c.json({ error: "Invalid provider category" }, 400);
				}

				// Check required documents
				const missingDocs = CATEGORY_VERIFICATION_REQUIREMENTS[
					category
				]?.requiredDocuments.filter(
					(doc) =>
						!docs[doc.key] ||
						typeof docs[doc.key] !== "string" ||
						!docs[doc.key].trim(),
				);
				if (missingDocs?.length > 0) {
					return c.json(
						{
							error: `Missing required document(s): ${missingDocs
								.map((d) => d.label)
								.join(", ")}`,
						},
						400,
					);
				}

				// Store provider data
				await db.user.update({
					where: { id: session.user.id },
					data: {
						userType: data.userType,
						providerCategory: category,
						providerVerificationDocs: docs as any,
						verificationStatus: "PENDING",
						onboardingComplete: true,
					},
				});
				return c.json({
					message: "Provider onboarding submitted for review.",
				});
			}

			// Update the existing user
			await db.user.update({
				where: { id: session.user.id },
				data: {
					onboardingComplete: true,
					userType: data.userType,
					matricNumber: data.matricNumber,
					department: data.department,
					level: data.level,
					studentIdCardUrl: data.studentIdCard,
					verificationStatus:
						data.userType === "STUDENT" ? "PENDING" : undefined,
					updatedAt: new Date(),
				},
			});

			return c.json({
				message:
					data.userType === "STUDENT"
						? "Student onboarding submitted for review."
						: "Onboarding completed successfully.",
			});
		},
	)
	/**
	 * Update verification document reference after client uploads to storage.
	 * Expects: { verificationDoc: string }
	 */
	.post(
		"/onboarding/verification-doc",
		validator("json", z.object({ verificationDoc: z.string().min(1) })),
		async (c) => {
			const session = await getSession();
			if (!session) {
				throw new HTTPException(401, { message: "Unauthorized" });
			}

			const { verificationDoc } = c.req.valid("json");

			try {
				const updatedUser = await db.user.update({
					where: { id: session.user.id },
					data: { verificationDoc },
				});
				return c.json({
					user: updatedUser,
					message: "Verification document updated successfully.",
				});
			} catch (err: any) {
				console.error("Verification doc update error:", err);
				return c.json(
					{ error: "Failed to update verification document." },
					500,
				);
			}
		},
	);
