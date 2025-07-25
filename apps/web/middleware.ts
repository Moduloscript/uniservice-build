import { routing } from "@i18n/routing";
import { config as appConfig } from "@repo/config";
import { createPurchasesHelper } from "@repo/payments/lib/helper";
import {
	getOrganizationsForSession,
	getPurchasesForSession,
	getSession,
} from "@shared/lib/middleware-helpers";
import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { withQuery } from "ufo";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
	const { pathname, origin } = req.nextUrl;

	if (pathname.startsWith("/app")) {
		const response = NextResponse.next();

		if (!appConfig.ui.saas.enabled) {
			return NextResponse.redirect(new URL("/", origin));
		}

		const session = await getSession(req);
		let locale = req.cookies.get(appConfig.i18n.localeCookieName)?.value;

		if (!session) {
			return NextResponse.redirect(
				new URL(
					withQuery("/auth/login", {
						redirectTo: pathname,
					}),
					origin,
				),
			);
		}

		if (
			appConfig.users.enableOnboarding &&
			!session.user.onboardingComplete &&
			pathname !== "/app/onboarding"
		) {
			return NextResponse.redirect(
				new URL(
					withQuery("/app/onboarding", {
						redirectTo: pathname,
					}),
					origin,
				),
			);
		}

		// NEW: Admin verification check - CRITICAL SECURITY FIX
		// Users must be verified by admin after completing onboarding
		if (
			session.user.onboardingComplete &&
			!session.user.isVerified &&
			pathname !== "/app/verification-pending"
		) {
			return NextResponse.redirect(
				new URL("/app/verification-pending", origin),
			);
		}

		if (
			!locale ||
			(session.user.locale && locale !== session.user.locale)
		) {
			locale = session.user.locale ?? appConfig.i18n.defaultLocale;
			response.cookies.set(appConfig.i18n.localeCookieName, locale);
		}

		if (
			appConfig.organizations.enable &&
			appConfig.organizations.requireOrganization &&
			pathname === "/app"
		) {
			const organizations = await getOrganizationsForSession(req);
			const organization =
				organizations.find(
					(org) => org.id === session?.session.activeOrganizationId,
				) || organizations[0];

			return NextResponse.redirect(
				new URL(
					organization
						? `/app/${organization.slug}`
						: "/app/new-organization",
					origin,
				),
			);
		}

		const hasFreePlan = Object.values(appConfig.payments.plans).some(
			(plan) => "isFree" in plan,
		);
		if (
			((appConfig.organizations.enable &&
				appConfig.organizations.enableBilling) ||
				appConfig.users.enableBilling) &&
			!hasFreePlan
		) {
			const organizationId = appConfig.organizations.enable
				? session?.session.activeOrganizationId ||
					(await getOrganizationsForSession(req))?.at(0)?.id
				: undefined;

			const purchases = await getPurchasesForSession(req, organizationId);
			const { activePlan } = createPurchasesHelper(purchases);

			const validPathsWithoutPlan = [
				"/app/choose-plan",
				"/app/onboarding",
				"/app/new-organization",
				"/app/verification-pending",
			];
			if (!activePlan && !validPathsWithoutPlan.includes(pathname)) {
				return NextResponse.redirect(
					new URL("/app/choose-plan", origin),
				);
			}
		}

		return response;
	}

	if (pathname.startsWith("/auth")) {
		if (!appConfig.ui.saas.enabled) {
			return NextResponse.redirect(new URL("/", origin));
		}

		const session = await getSession(req);

		if (session && pathname !== "/auth/reset-password") {
			return NextResponse.redirect(new URL("/app", origin));
		}

		return NextResponse.next();
	}

	// Admin route protection
	if (pathname.startsWith("/admin")) {
		const session = await getSession(req);
		if (!session) {
			return NextResponse.redirect(
				new URL(
					withQuery("/auth/login", { redirectTo: pathname }),
					origin,
				),
			);
		}
		if (session.user.role !== "admin") {
			return NextResponse.redirect(new URL("/app", origin));
		}
		return NextResponse.next();
	}

	// Provider route protection - Only providers can access provider dashboard
	if (pathname.startsWith("/app/provider")) {
		const session = await getSession(req);
		if (!session) {
			return NextResponse.redirect(
				new URL(
					withQuery("/auth/login", { redirectTo: pathname }),
					origin,
				),
			);
		}

		// Check if user has PROVIDER userType
		if (session.user.userType !== "PROVIDER") {
			// Redirect students to main app
			if (session.user.userType === "STUDENT") {
				return NextResponse.redirect(new URL("/app", origin));
			}

			// Redirect admins to admin dashboard
			if (session.user.role === "admin") {
				return NextResponse.redirect(new URL("/app/admin", origin));
			}

			// Redirect others to main app
			return NextResponse.redirect(new URL("/app", origin));
		}

		// Check if provider has completed onboarding
		if (!session.user.onboardingComplete) {
			return NextResponse.redirect(new URL("/app/onboarding", origin));
		}

		// Check if provider is verified (if verification is required)
		if (!session.user.isVerified) {
			return NextResponse.redirect(
				new URL("/app/verification-pending", origin),
			);
		}

		return NextResponse.next();
	}

	if (!appConfig.ui.marketing.enabled) {
		return NextResponse.redirect(new URL("/app", origin));
	}

	return intlMiddleware(req);
}

export const config = {
	matcher: [
		"/((?!api|image-proxy|images|fonts|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
