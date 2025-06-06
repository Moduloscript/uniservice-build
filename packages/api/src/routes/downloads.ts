import { getSession } from "@repo/auth/lib/server";
import { db } from "@repo/database";
import { getSignedUrl } from "@repo/storage";
import { Hono } from "hono";
import { validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

/**
 * Secure download endpoint for sensitive user documents (verification docs, student ID cards).
 * Only the document owner or an admin can access the file.
 *
 * POST /api/downloads/signed-url
 * Body: { bucket: string, path: string }
 * Returns: { signedUrl: string }
 */
const downloadSchema = z.object({
	bucket: z.enum(["verification-docs", "student-id-cards"]),
	path: z.string().min(1),
});

export const downloadsRouter = new Hono()
	.use(authMiddleware)
	.post("/signed-url", validator("json", downloadSchema), async (c) => {
		const session = await getSession();
		if (!session) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}
		const { bucket, path } = c.req.valid("json");

		// Only allow access to own files or if admin
		const isAdmin = session.user.role === "ADMIN";
		const userId = session.user.id;
		const allowedPrefix = `${bucket}/${userId}-`;
		if (!isAdmin && !path.startsWith(allowedPrefix)) {
			throw new HTTPException(403, {
				message: "Forbidden: Not your document",
			});
		}

		// Optionally: check if file is referenced in DB for extra safety
		if (!isAdmin) {
			const user = await db.user.findUnique({ where: { id: userId } });
			if (!user) {
				throw new HTTPException(404, { message: "User not found" });
			}
			if (
				bucket === "student-id-cards" &&
				user.studentIdCardUrl !== path
			) {
				throw new HTTPException(403, {
					message: "No access to this file",
				});
			}
			if (
				bucket === "verification-docs" &&
				(!user.providerVerificationDocs ||
					!Object.values(user.providerVerificationDocs).includes(
						path,
					)) &&
				user.verificationDoc !== path // fallback for legacy field
			) {
				throw new HTTPException(403, {
					message: "No access to this file",
				});
			}
		}

		// Issue signed download URL (short expiry)
		const signedUrl = await getSignedUrl(path, { bucket, expiresIn: 60 });
		return c.json({ signedUrl });
	});
