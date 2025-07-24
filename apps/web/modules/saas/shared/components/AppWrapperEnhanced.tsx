"use client";

import { config } from "@repo/config";
import { AppSidebar } from "@saas/shared/components/AppSidebar";
import { NavBar } from "@saas/shared/components/NavBar";
import { cn } from "@ui/lib";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@ui/components/sidebar";
import { Separator } from "@ui/components/separator";
import type { PropsWithChildren } from "react";

export function AppWrapperEnhanced({ children }: PropsWithChildren) {
	const { useSidebarLayout, enableEnhancedSidebar } = config.ui.saas;

	// If enhanced sidebar is not enabled, fallback to the original implementation
	if (!useSidebarLayout || !enableEnhancedSidebar) {
		return (
			<div
				className={cn(
					"bg-[radial-gradient(farthest-corner_at_0%_0%,color-mix(in_oklch,var(--color-primary),transparent_95%)_0%,var(--color-background)_50%)] dark:bg-[radial-gradient(farthest-corner_at_0%_0%,color-mix(in_oklch,var(--color-primary),transparent_90%)_0%,var(--color-background)_50%)]",
				)}
			>
				<NavBar />
				<main className="container max-w-6xl py-6">{children}</main>
			</div>
		);
	}

	// Modern enhanced sidebar layout
	return (
		<div
			className={cn(
				"bg-[radial-gradient(farthest-corner_at_0%_0%,color-mix(in_oklch,var(--color-primary),transparent_95%)_0%,var(--color-background)_50%)] dark:bg-[radial-gradient(farthest-corner_at_0%_0%,color-mix(in_oklch,var(--color-primary),transparent_90%)_0%,var(--color-background)_50%)]",
				"min-h-screen",
			)}
		>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 z-40">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 h-4"
						/>
						{/* Breadcrumbs or other header content can be added here */}
						<div className="flex flex-1 items-center justify-between">
							<div className="flex items-center space-x-2">
								{/* Future: Add dynamic breadcrumbs based on current route */}
							</div>
							<div className="flex items-center space-x-2">
								{/* Future: Add header actions like notifications, search, etc. */}
							</div>
						</div>
					</header>
					<div className="flex flex-1 flex-col">
						<main className="flex-1 p-6">{children}</main>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
