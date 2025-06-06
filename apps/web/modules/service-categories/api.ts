import type { ServiceCategory } from "./types";

/**
 * Fetch all service categories from the backend API.
 */
export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
	const res = await fetch("/api/service-categories", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		cache: "no-store",
	});
	if (!res.ok) {
		throw new Error("Failed to fetch service categories");
	}
	const data = await res.json();
	return data.categories as ServiceCategory[];
}
