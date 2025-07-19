import { getSession } from "@repo/auth/lib/server";
import { Prisma, db } from "@repo/database";
import { sendEmail } from "@repo/mail";
import { getBaseUrl } from "@repo/utils";
import { Hono } from "hono";
import { validator } from "hono-openapi/zod";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth";

// Use a symbol for the admin user context key to avoid type errors
const adminUserKey = Symbol("adminUser");

type AdminUser = {
	id: string;
	role: string;
};

// RBAC middleware: only allow admins/superadmins
async function adminOnly(c: any, next: any) {
	const session = await getSession();
	if (
		!session ||
		(session.user.role !== "admin" && session.user.role !== "superadmin")
	) {
		return c.json({ error: "Forbidden: Admins only" }, 403);
	}
	c.set(adminUserKey, session.user as AdminUser);
	await next();
}


export const verificationDocsAdminRouter = new Hono()
	.use(authMiddleware)
	.use(adminOnly)
	// List all users with pending verification
	.get("/pending", async (c: any) => {
		const users = await db.user.findMany({
			where: {
				verificationStatus: "PENDING",
				// Show all pending users, even without uploaded documents
			},
			select: {
				id: true,
				name: true,
				email: true,
				userType: true,
				matricNumber: true,
				department: true,
				level: true,
				providerCategory: true,
				providerVerificationDocs: true,
				verificationDoc: true,
				studentIdCardUrl: true,
				verificationStatus: true,
				verificationNotes: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: { createdAt: "desc" },
		});
		return c.json({ users });
	})
	// Approve a user's verification document
	.post(
		"/:userId/approve",
		validator("json", z.object({})),
		async (c: any) => {
			const { userId } = c.req.param();
			const admin = c.get(adminUserKey) as AdminUser;
			const user = await db.user.update({
				where: { id: userId },
				data: {
					verificationStatus: "APPROVED",
					isVerified: true, // Set isVerified for middleware check
					verified: true, // Also set the verified field
					verificationReviewedBy: admin.id,
					verificationReviewedAt: new Date(),
					verificationNotes: null,
				},
			});
			// Send approval email using proper template
			await sendEmail({
				to: user.email,
				templateId: "verificationApproved",
				context: {
					name: user.name,
					loginUrl: `${getBaseUrl()}/app`,
				},
			});
			return c.json({ user });
		},
	)
	// Reject a user's verification document
	.post(
		"/:userId/reject",
		validator("json", z.object({ notes: z.string().optional() })),
		async (c: any) => {
			const { userId } = c.req.param();
			const { notes } = c.req.valid("json");
			const admin = c.get(adminUserKey) as AdminUser;
			const user = await db.user.update({
				where: { id: userId },
				data: {
					verificationStatus: "REJECTED",
					isVerified: false, // Ensure isVerified is false
					verified: false, // Also set the verified field
					verificationReviewedBy: admin.id,
					verificationReviewedAt: new Date(),
					verificationNotes: notes || "No specific feedback provided.",
				},
			});
			// Send rejection email using proper template
			await sendEmail({
				to: user.email,
				templateId: "verificationRejected",
				context: {
					name: user.name,
					notes: notes || "No specific feedback provided.",
					resubmitUrl: `${getBaseUrl()}/app/onboarding`,
				},
			});
			return c.json({ user });
		},
	);
