"use client";

import { config } from "@repo/config";
import { AppWrapper } from "@saas/shared/components/AppWrapper";
import { AppWrapperEnhanced } from "@saas/shared/components/AppWrapperEnhanced";
import type { PropsWithChildren } from "react";

/**
 * Migration utility component that safely switches between old and new layout systems
 * based on the enableEnhancedSidebar feature flag
 */
export function LayoutMigrationWrapper({ children }: PropsWithChildren) {
	const { enableEnhancedSidebar } = config.ui.saas;

	// Use enhanced sidebar if feature flag is enabled, otherwise fallback to original
	if (enableEnhancedSidebar) {
		return <AppWrapperEnhanced>{children}</AppWrapperEnhanced>;
	}

	return <AppWrapper>{children}</AppWrapper>;
}
