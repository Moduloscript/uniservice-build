import type { Service, ServicesResponse, ServiceResponse, ApiErrorResponse } from "./types";
import { db } from "@repo/database";
import { headers } from "next/headers";

/**
 * Get the base URL for API calls
 * Works in both client and server contexts
 */
function getBaseUrl(): string {
	// Browser context
	if (typeof window !== 'undefined') {
		return '';
	}
	
	// Server context - check various environment variables
	if (process.env.NEXT_PUBLIC_SITE_URL) {
		return process.env.NEXT_PUBLIC_SITE_URL;
	}
	
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	
	if (process.env.NEXT_PUBLIC_APP_URL) {
		return process.env.NEXT_PUBLIC_APP_URL;
	}
	
	// Default to localhost for development
	return 'http://localhost:3000';
}

/**
 * Fetch all services, optionally filtered by categoryId.
 */
export async function fetchServices(categoryId?: string): Promise<Service[]> {
	const baseUrl = getBaseUrl();
	const path = categoryId
		? `/api/services?categoryId=${encodeURIComponent(categoryId)}`
		: "/api/services";
	const url = `${baseUrl}${path}`;
	
	const res = await fetch(url, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		cache: "no-store",
		credentials: "include",
	});
	
	if (!res.ok) {
		let errorMessage = "Failed to fetch services";
		try {
			const errorData: ApiErrorResponse = await res.json();
			errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
		} catch {
			errorMessage = `HTTP ${res.status}: ${res.statusText}`;
		}
		throw new Error(errorMessage);
	}
	
	const data: ServicesResponse = await res.json();
	if (!data.services) {
		throw new Error("Services not found in response");
	}
	return data.services;
}

/**
 * Fetch a single service by ID.
 */
export async function fetchServiceById(id: string): Promise<Service> {
	const baseUrl = getBaseUrl();
	const url = `${baseUrl}/api/services/${id}`;
	
	console.log(`[Client] Fetching service from URL: ${url}`);
	
	const res = await fetch(url, {
		method: "GET",
		headers: { 
			"Content-Type": "application/json",
		},
		cache: "no-store",
		credentials: "include",
	});
	
	if (!res.ok) {
		let errorMessage = "Failed to fetch service";
		try {
			const errorData: ApiErrorResponse = await res.json();
			errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
		} catch {
			errorMessage = `HTTP ${res.status}: ${res.statusText}`;
		}
		throw new Error(errorMessage);
	}
	
	const data: ServiceResponse = await res.json();
	if (!data.service) {
		throw new Error("Service not found in response");
	}
	return data.service;
}

/**
 * Server-side function to fetch service by ID directly from database
 * This avoids the HTTP fetch issue in server components
 */
export async function fetchServiceByIdServer(id: string): Promise<Service | null> {
	if (typeof window !== 'undefined') {
		throw new Error('fetchServiceByIdServer should only be called on the server');
	}
	
	console.log(`[Server] Fetching service with ID: ${id}`);
	
	try {
		const service = await db.service.findUnique({
			where: { id },
			include: { 
				category: true, 
				provider: {
					select: {
						id: true,
						name: true,
						email: true,
						userType: true,
					}
				}
			},
		});
		
		if (!service) {
			console.log(`[Server] Service not found for ID: ${id}`);
			return null;
		}
		
		console.log(`[Server] Successfully found service: ${service.name}`);
		
		// Convert Prisma Decimal to number for frontend
		return {
			...service,
			price: Number(service.price),
			createdAt: service.createdAt.toISOString(),
			updatedAt: service.updatedAt.toISOString(),
		} as Service;
		
	} catch (error) {
		console.error(`[Server] Database error for ID ${id}:`, error);
		return null;
	}
}
