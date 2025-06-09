import { getSession } from "@repo/auth/lib/server";
import { Prisma, db } from "@repo/database";
import { sendEmail } from "@repo/mail";
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

// Function to generate email HTML content
function getVerificationStatusEmailHtml({
	name,
	status,
	notes,
}: {
	name: string;
	status: string;
	notes?: string;
}) {
	if (status === "APPROVED") {
		return `<p>Hi ${name},</p><p>Your verification has been <b>approved</b>. You can now access all features.</p>`;
	}
	return `<p>Hi ${name},</p><p>Your verification was <b>rejected</b>. Reason: ${
		notes ? notes : "No reason provided."
	}</p>`;
}

export const verificationDocsAdminRouter = new Hono()
	.use(authMiddleware)
	.use(adminOnly)
	// List all users with pending verification
	.get("/pending", async (c: any) => {
		const users = await db.user.findMany({
			where: {
				verificationStatus: "PENDING",
				OR: [
					{ verificationDoc: { not: null } },
					{ providerVerificationDocs: { not: Prisma.JsonNull } },
				],
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
					verificationReviewedBy: admin.id,
					verificationReviewedAt: new Date(),
					verificationNotes: null,
				},
			});
			// Send approval email (plain HTML)
			await sendEmail({
				to: user.email,
				subject: "Your verification has been approved",
				html: getVerificationStatusEmailHtml({
					name: user.name,
					status: "APPROVED",
				}),
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
					verificationReviewedBy: admin.id,
					verificationReviewedAt: new Date(),
				},
			});
			// Send rejection email (plain HTML)
			await sendEmail({
				to: user.email,
				subject: "Your verification has been rejected",
				html: getVerificationStatusEmailHtml({
					name: user.name,
					status: "REJECTED",
					notes,
				}),
			});
			return c.json({ user });
		},
	);
