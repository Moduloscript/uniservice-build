import type { Context, Next } from "hono";
import { createHash } from "crypto";

// In-memory cache for request deduplication
const requestCache = new Map<string, { timestamp: number; response?: any }>();
const CACHE_DURATION = 5000; // 5 seconds

/**
 * Middleware to prevent duplicate requests
 * Uses a combination of user ID, request method, path, and body hash
 */
export const deduplicationMiddleware = async (c: Context, next: Next) => {
	// Only apply to POST, PUT, PATCH requests
	const method = c.req.method;
	if (!["POST", "PUT", "PATCH"].includes(method)) {
		return next();
	}

	try {
		// Get user from context (if authenticated)
		const user = c.get("user");
		if (!user?.id) {
			// Skip deduplication for unauthenticated requests
			return next();
		}

		// Get request body
		const body = await c.req.raw.clone().text();

		// Create a unique key for this request
		const requestKey = createRequestKey(user.id, method, c.req.path, body);

		// Check if we have a recent request with the same key
		const cached = requestCache.get(requestKey);
		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			console.warn(
				`[Deduplication] Duplicate request detected: ${requestKey}`,
			);

			// If we have a cached response, return it
			if (cached.response) {
				return c.json(cached.response, 200);
			}

			// Otherwise, return an error
			return c.json(
				{
					error: "Duplicate request detected. Please wait a moment before trying again.",
					code: "DUPLICATE_REQUEST",
				},
				409,
			);
		}

		// Store the request in cache
		requestCache.set(requestKey, { timestamp: Date.now() });

		// Clean up old entries periodically
		cleanupCache();

		// Proceed with the request
		await next();

		// Cache the successful response
		if (c.res.status >= 200 && c.res.status < 300) {
			try {
				const responseBody = await c.res.clone().json();
				const cachedEntry = requestCache.get(requestKey);
				if (cachedEntry) {
					cachedEntry.response = responseBody;
				}
			} catch (e) {
				// Ignore errors when caching response
			}
		}
	} catch (error) {
		console.error("[Deduplication] Error in middleware:", error);
		// Don't block the request on errors
		return next();
	}
};

/**
 * Create a unique key for the request
 */
function createRequestKey(
	userId: string,
	method: string,
	path: string,
	body: string,
): string {
	const hash = createHash("sha256");
	hash.update(`${userId}:${method}:${path}:${body}`);
	return hash.digest("hex");
}

/**
 * Clean up old entries from the cache
 */
function cleanupCache() {
	const now = Date.now();
	const entriesToDelete: string[] = [];

	requestCache.forEach((value, key) => {
		if (now - value.timestamp > CACHE_DURATION * 2) {
			entriesToDelete.push(key);
		}
	});

	entriesToDelete.forEach((key) => requestCache.delete(key));
}

/**
 * Deduplication middleware for specific routes
 * This version only applies to service creation endpoints
 */
export const serviceDeduplicationMiddleware = async (
	c: Context,
	next: Next,
) => {
	// Only apply to service creation endpoint
	if (c.req.path === "/api/services" && c.req.method === "POST") {
		return deduplicationMiddleware(c, next);
	}
	return next();
};
