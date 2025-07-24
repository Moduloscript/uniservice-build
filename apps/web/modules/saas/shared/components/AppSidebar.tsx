"use client";

import * as React from "react";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { OrganzationSelect } from "../../organizations/components/OrganizationSelect";
import { UserMenu } from "@saas/shared/components/UserMenu";
import { Logo } from "@shared/components/Logo";
import { ChevronRight } from "lucide-react";
import {
	BotMessageSquareIcon,
	CalendarIcon,
	HomeIcon,
	SettingsIcon,
	StoreIcon,
	UserCog2Icon,
	UserCogIcon,
	LayoutDashboard,
	BarChart3,
	User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@ui/components/collapsible";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@ui/components/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const t = useTranslations();
	const pathname = usePathname();
	const { user } = useSession();
	const { activeOrganization } = useActiveOrganization();

	const basePath = activeOrganization
		? `/app/${activeOrganization.slug}`
		: "/app";

	// Check if user is a provider (has provider role or is in provider routes)
	const isProvider =
		user?.role === "provider" || pathname?.startsWith("/app/provider");

	// Group menu items into collapsible sections
	const navigationData = [
		{
			title: t("app.menu.main"),
			items: [
				{
					title: t("app.menu.start"),
					url: basePath,
					icon: HomeIcon,
					isActive: pathname === basePath,
				},
				{
					title: t("app.menu.aiChatbot"),
					url: activeOrganization
						? `/app/${activeOrganization.slug}/chatbot`
						: "/app/chatbot",
					icon: BotMessageSquareIcon,
					isActive: pathname?.includes("/chatbot"),
				},
			],
		},
		{
			title: "Services & Bookings",
			items: [
				{
					title: "Services",
					url: "/app/services",
					icon: StoreIcon,
					isActive: pathname?.startsWith("/app/services"),
				},
				{
					title: "Bookings",
					url: "/app/bookings",
					icon: CalendarIcon,
					isActive: pathname?.startsWith("/app/bookings"),
				},
			],
		},
		// Provider Dashboard Section - only show if user is a provider
		...(isProvider
			? [
					{
						title: "Provider Dashboard",
						items: [
							{
								title: "Dashboard",
								url: "/app/provider",
								icon: LayoutDashboard,
								isActive: pathname === "/app/provider",
							},
							{
								title: "My Services",
								url: "/app/provider/services",
								icon: SettingsIcon,
								isActive: pathname?.startsWith(
									"/app/provider/services",
								),
							},
							{
								title: "Availability",
								url: "/app/provider/availability",
								icon: CalendarIcon,
								isActive: pathname?.startsWith(
									"/app/provider/availability",
								),
							},
							{
								title: "Analytics",
								url: "/app/provider/analytics",
								icon: BarChart3,
								isActive:
									pathname === "/app/provider/analytics",
								badge: "Soon",
							},
							{
								title: "Profile",
								url: "/app/provider/profile",
								icon: User,
								isActive: pathname === "/app/provider/profile",
							},
						],
					},
				]
			: []),
		{
			title: "Settings",
			items: [
				...(activeOrganization
					? [
							{
								title: t("app.menu.organizationSettings"),
								url: `${basePath}/settings`,
								icon: SettingsIcon,
								isActive: pathname?.startsWith(
									`${basePath}/settings/`,
								),
							},
						]
					: [
							{
								title: t("app.menu.accountSettings"),
								url: "/app/settings",
								icon: UserCog2Icon,
								isActive:
									pathname?.startsWith("/app/settings/"),
							},
						]),
				...(user?.role === "admin"
					? [
							{
								title: t("app.menu.admin"),
								url: "/app/admin",
								icon: UserCogIcon,
								isActive: pathname?.startsWith("/app/admin/"),
							},
						]
					: []),
			],
		},
	];

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<div className="flex items-center gap-2">
					<Link href="/app" className="flex items-center gap-2">
						<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
							<Logo className="size-4" />
						</div>
						<div className="flex flex-col gap-0.5 leading-none">
							<span className="font-medium">
								{config.app.name}
							</span>
							<span className="text-xs text-sidebar-muted-foreground">
								App
							</span>
						</div>
					</Link>
				</div>

				{config.organizations.enable &&
					!config.organizations.hideOrganization && (
						<div className="mt-2">
							<OrganzationSelect className="-mx-2" />
						</div>
					)}
			</SidebarHeader>

			<SidebarContent className="gap-0">
				{/* We create a collapsible SidebarGroup for each parent section. */}
				{navigationData.map((section) => (
					<Collapsible
						key={section.title}
						title={section.title}
						defaultOpen
						className="group/collapsible"
					>
						<SidebarGroup>
							<SidebarGroupLabel
								asChild
								className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
							>
								<CollapsibleTrigger>
									{section.title}{" "}
									<ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
								</CollapsibleTrigger>
							</SidebarGroupLabel>
							<CollapsibleContent>
								<SidebarGroupContent>
									<SidebarMenu>
										{section.items.map((item) => (
											<SidebarMenuItem key={item.title}>
												<SidebarMenuButton
													asChild
													isActive={item.isActive}
												>
													<Link
														href={item.url}
														className="flex items-center gap-2"
													>
														<item.icon className="size-4" />
														<span>
															{item.title}
														</span>
														{/* @ts-ignore - badge property may not exist on all items */}
														{item.badge && (
															<span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
																{item.badge}
															</span>
														)}
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										))}
									</SidebarMenu>
								</SidebarGroupContent>
							</CollapsibleContent>
						</SidebarGroup>
					</Collapsible>
				))}
			</SidebarContent>

			{/* Footer with UserMenu */}
			<div className="mt-auto border-t border-sidebar-border p-4">
				<UserMenu showUserName />
			</div>

			<SidebarRail />
		</Sidebar>
	);
}
