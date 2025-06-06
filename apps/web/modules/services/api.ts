import type { Service } from "./types";

/**
 * Fetch all services, optionally filtered by categoryId.
 */
export async function fetchServices(categoryId?: string): Promise<Service[]> {
	const url = categoryId
		? `/api/services?categoryId=${encodeURIComponent(categoryId)}`
		: "/api/services";
	const res = await fetch(url, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		cache: "no-store",
	});
	if (!res.ok) {
		throw new Error("Failed to fetch services");
	}
	const data = await res.json();
	return data.services as Service[];
}

/**
 * Fetch a single service by ID.
 */
export async function fetchServiceById(id: string): Promise<Service> {
	const res = await fetch(`/api/services/${id}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		cache: "no-store",
	});
	if (!res.ok) {
		throw new Error("Failed to fetch service");
	}
	const data = await res.json();
	return data.service as Service;
}
