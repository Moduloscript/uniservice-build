import { getSession } from "@saas/auth/lib/server";
import { redirect } from "next/navigation";
import { VerificationStatusCard } from "./components/verification-status-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VerificationPendingPage() {
	const session = await getSession();

	if (!session) {
		return redirect("/auth/login");
	}

	// If user is already verified, redirect to main app
	if (session.user.isVerified) {
		return redirect("/app");
	}

	return (
		<div className="flex items-center justify-center min-h-screen p-4">
			<div className="w-full max-w-2xl">
				<VerificationStatusCard userId={session.user.id} />
			</div>
		</div>
	);
}
