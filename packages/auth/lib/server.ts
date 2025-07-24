import "server-only";
import { auth } from "../auth";
import { headers } from "next/headers";

// Simple in-memory cache for server-only usage
const sessionCache = new Map<string, any>();
const orgCache = new Map<string, any>();

/**
 * Retrieves the current session for the authenticated user.
 * Uses caching to optimize repeated calls.
 */
export async function getSession() {
	const headersList = await headers();
	const sessionId =
		headersList.get("authorization") ||
		headersList.get("cookie") ||
		"anonymous";
	const cacheKey = `session:${sessionId}`;
	if (sessionCache.has(cacheKey)) {
		return sessionCache.get(cacheKey);
	}
	const session = await auth.api.getSession({
		headers: await headers(),
		query: { disableCookieCache: true },
	});
	sessionCache.set(cacheKey, session);
	return session;
}

/**
 * Retrieves the active organization for the given slug.
 * Uses caching to optimize repeated calls.
 *
 * @param slug - The organization slug to fetch.
 */
export async function getActiveOrganization(slug: string) {
	if (orgCache.has(slug)) {
		return orgCache.get(slug);
	}
	try {
		const activeOrganization = await auth.api.getFullOrganization({
			query: { organizationSlug: slug },
			headers: await headers(),
		});
		orgCache.set(slug, activeOrganization);
		return activeOrganization;
	} catch (error) {
		console.error("Failed to fetch active organization:", error);
		throw error;
	}
}
