import { config } from "@repo/config";
import { getSession } from "@saas/auth/lib/server";
import { Logo } from "@shared/components/Logo";
import { Building2Icon, FileCheck2Icon, UsersIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { PropsWithChildren } from "react";

export default async function AdminLayout({ children }: PropsWithChildren) {
	const t = await getTranslations();
	const session = await getSession();

	if (!session) {
		return redirect("/auth/login");
	}

	if (session.user?.role !== "admin") {
		redirect("/app");
	}

	return (
		<div className="flex flex-col">
			{/* Admin Navigation Header */}
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container max-w-6xl px-4 py-4">
					<div className="flex items-center gap-3 pb-4">
						<Logo className="size-8" withLabel={false} />
						<div className="flex min-w-0 flex-col">
							<h1 className="truncate text-lg font-semibold">
								{t("admin.title")}
							</h1>
							<p className="truncate text-sm text-muted-foreground">
								{t("admin.description")}
							</p>
						</div>
					</div>
					{/* Admin Navigation Links */}
					<nav>
						<ul className="flex list-none items-center gap-6 text-sm">
							<li>
								<Link
									href="/app/admin/users"
									className="flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 pb-3 hover:text-foreground/80"
								>
									<UsersIcon className="size-4 opacity-50" />
									{t("admin.menu.users")}
								</Link>
							</li>
							<li>
								<Link
									href="/app/admin/verification-docs"
									className="flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 pb-3 hover:text-foreground/80"
								>
									<FileCheck2Icon className="size-4 opacity-50" />
									Verification Docs
								</Link>
							</li>
							{config.organizations.enable && (
								<li>
									<Link
										href="/app/admin/organizations"
										className="flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 pb-3 hover:text-foreground/80"
									>
										<Building2Icon className="size-4 opacity-50" />
										{t("admin.menu.organizations")}
									</Link>
								</li>
							)}
						</ul>
					</nav>
				</div>
			</div>
			{/* Main Content Area */}
			<div className="container max-w-6xl px-4 py-6">{children}</div>
		</div>
	);
}
