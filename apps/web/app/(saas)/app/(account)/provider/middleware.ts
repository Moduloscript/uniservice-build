import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@repo/auth/lib/server";

/**
 * Middleware to check if user has PROVIDER role
 * Redirects unauthorized users to appropriate pages
 */
export async function providerAuthMiddleware(request: NextRequest) {
	try {
		const session = await getSession();

		// Check if user is authenticated
		if (!session?.user) {
			const loginUrl = new URL("/auth/login", request.url);
			loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
			return NextResponse.redirect(loginUrl);
		}

		// Check if user has PROVIDER role
		if (session.user.userType !== "PROVIDER") {
			// Redirect students to main app
			if (session.user.userType === "STUDENT") {
				return NextResponse.redirect(new URL("/app", request.url));
			}

			// Redirect admins to admin dashboard
			if (session.user.userType === "ADMIN") {
				return NextResponse.redirect(
					new URL("/app/admin", request.url),
				);
			}

			// Redirect others to main app
			return NextResponse.redirect(new URL("/app", request.url));
		}

		// Check if provider has completed onboarding
		if (!session.user.onboardingComplete) {
			return NextResponse.redirect(
				new URL("/app/onboarding", request.url),
			);
		}

		// Check if provider is verified (optional, depends on your requirements)
		if (!session.user.isVerified) {
			const verificationUrl = new URL(
				"/app/verification-pending",
				request.url,
			);
			return NextResponse.redirect(verificationUrl);
		}

		return NextResponse.next();
	} catch (error) {
		console.error("Provider auth middleware error:", error);
		return NextResponse.redirect(new URL("/auth/login", request.url));
	}
}

/**
 * Helper function to check user role server-side
 */
export async function requireProviderRole() {
	const session = await getSession();

	if (!session?.user) {
		throw new Error("User not authenticated");
	}

	if (session.user.userType !== "PROVIDER") {
		throw new Error("User is not a provider");
	}

	return session.user;
}

/**
 * Helper function to get current provider user
 */
export async function getCurrentProvider() {
	const session = await getSession();

	if (!session?.user || session.user.userType !== "PROVIDER") {
		return null;
	}

	return session.user;
}
