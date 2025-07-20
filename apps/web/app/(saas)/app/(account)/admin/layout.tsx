import { config } from "@repo/config";
import { getSession } from "@saas/auth/lib/server";
import { CollapsibleSettingsMenu } from "@saas/settings/components/CollapsibleSettingsMenu";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { Logo } from "@shared/components/Logo";
import { Building2Icon, FileCheck2Icon, UsersIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger 
} from "@ui/components/sidebar";
import { Separator } from "@ui/components/separator";

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
		<SidebarProvider defaultOpen={true}>
			<CollapsibleSettingsMenu
				menuItems={[
					{
						avatar: (
							<Logo
								className="size-8"
								withLabel={false}
							/>
						),
						title: t("admin.title"),
						items: [
							{
								title: t("admin.menu.users"),
								href: "/app/admin/users",
								icon: (
									<UsersIcon className="size-4 opacity-50" />
								),
							},
							{
								title: "Verification Docs",
								href: "/app/admin/verification-docs",
								icon: (
									<FileCheck2Icon className="size-4 opacity-50" />
								),
							},
							...(config.organizations.enable
								? [
										{
											title: t(
												"admin.menu.organizations",
											),
											href: "/app/admin/organizations",
											icon: (
												<Building2Icon className="size-4 opacity-50" />
											),
										},
									]
								: []),
						],
					},
				]}
			/>
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 h-4" />
					<div className="flex flex-col">
						<h1 className="text-lg font-semibold">{t("admin.title")}</h1>
						<p className="text-sm text-muted-foreground">{t("admin.description")}</p>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
