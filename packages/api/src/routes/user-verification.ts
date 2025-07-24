import { db } from "@repo/database";
import { authMiddleware } from "../middleware/auth";
import { Hono } from "hono";

export const userVerificationRouter = new Hono().get(
	"/user/verification-status",
	authMiddleware,
	async (c) => {
		const user = c.get("user");

		try {
			const userData = await db.user.findUnique({
				where: { id: user.id },
				select: {
					id: true,
					name: true,
					email: true,
					verified: true,
					isVerified: true,
					verificationStatus: true,
					verificationNotes: true,
					verificationReviewedAt: true,
					verificationReviewedBy: true,
					createdAt: true,
					userType: true,
				},
			});

			if (!userData) {
				return c.json({ error: "User not found" }, 404);
			}

			return c.json({
				user: userData,
				status: userData.verificationStatus || "PENDING",
				message: getStatusMessage(userData.verificationStatus),
			});
		} catch (error) {
			console.error("Error fetching user verification status:", error);
			return c.json(
				{ error: "Failed to fetch verification status" },
				500,
			);
		}
	},
);

function getStatusMessage(status: string | null): string {
	switch (status) {
		case "PENDING":
			return "Your account is being reviewed by our admin team. This usually takes 1-2 business days.";
		case "APPROVED":
			return "Your account has been approved! You now have full access to the platform.";
		case "REJECTED":
			return "Your verification was rejected. Please check the notes below and resubmit if necessary.";
		default:
			return "Your account verification is pending review.";
	}
}
