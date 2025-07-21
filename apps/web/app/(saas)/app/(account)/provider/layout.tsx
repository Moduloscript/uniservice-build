import { getSession } from "@saas/auth/lib/server";
import { redirect } from "next/navigation";
import { ProviderNavigation } from "./components/ProviderNavigation";
import type { PropsWithChildren } from "react";

export default async function ProviderLayout({ children }: PropsWithChildren) {
	const session = await getSession();

	if (!session) {
		return redirect("/auth/login");
	}

	if (session.user?.userType !== "PROVIDER") {
		redirect("/app");
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Provider Navigation */}
			<ProviderNavigation />
			
			{/* Main Content */}
			<div className="flex-1">
				{children}
			</div>
		</div>
	);
}
