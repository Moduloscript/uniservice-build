import type { ServiceCategory } from "./types";

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
	const apiUrl = typeof window === "undefined" 
		? "http://localhost:3000/api/service-categories" 
		: "/api/service-categories";

	const res = await fetch(apiUrl, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		cache: "no-store",
		credentials: "include",
	});

	if (!res.ok) {
		throw new Error(`Failed to fetch service categories: ${res.status} ${res.statusText}`);
	}

	const data = await res.json();
	return data.categories as ServiceCategory[];
}
