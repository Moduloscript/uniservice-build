import type { Service, ServicesResponse, ServiceResponse, ApiErrorResponse } from "./types";
import type { Review, ReviewsResponse, ReviewResponse, CreateReviewData, UpdateReviewData, ReviewApiError } from "./types/review";
import type { ServiceFeature, ServiceFeaturesResponse, ServiceFeatureResponse, CreateServiceFeatureData, UpdateServiceFeatureData, ServiceFeatureApiError } from "./types/service-feature";
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
export async function fetchServices(): Promise<Service[]>;
export async function fetchServices(categoryId: string): Promise<Service[]>;
export async function fetchServices(filters: { categoryId?: string; providerId?: string }): Promise<Service[]>;
export async function fetchServices(categoryIdOrFilters?: string | { categoryId?: string; providerId?: string }): Promise<Service[]> {
	const baseUrl = getBaseUrl();
const filters = typeof categoryIdOrFilters === 'string' 
  ? { categoryId: categoryIdOrFilters }
  : categoryIdOrFilters;

const queryParams = new URLSearchParams();
if (filters?.categoryId) queryParams.append("categoryId", filters.categoryId);
if (filters?.providerId) queryParams.append("providerId", filters.providerId);
const path = queryParams.toString() 
  ? `/api/services?${queryParams.toString()}`
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

// SERVICE FEATURES API FUNCTIONS

/**
 * Fetch all features for a service
 */
export async function fetchServiceFeatures(serviceId: string): Promise<ServiceFeature[]> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/services/${serviceId}/features`;

    console.log(`[Client] Fetching features for service: ${serviceId}`);

    const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "include",
    });

    if (!res.ok) {
        let errorMessage = "Failed to fetch service features";
        try {
            const errorData: ServiceFeatureApiError = await res.json();
            errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
        } catch {
            errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
    }

    const data: ServiceFeaturesResponse = await res.json();
    return data.features;
}

/**
 * Add a new feature to a service
 */
export async function addServiceFeature(serviceId: string, featureData: CreateServiceFeatureData): Promise<ServiceFeature> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/services/${serviceId}/features`;

    console.log(`[Client] Adding feature for service: ${serviceId}`, featureData);

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(featureData),
        credentials: "include",
    });

    if (!res.ok) {
        let errorMessage = "Failed to add service feature";
        try {
            const errorData: ServiceFeatureApiError = await res.json();
            errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
        } catch {
            errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
    }

    const data: ServiceFeatureResponse = await res.json();
    return data.feature;
}

/**
 * Update a feature for a service
 */
export async function updateServiceFeature(serviceId: string, featureId: string, featureData: UpdateServiceFeatureData): Promise<ServiceFeature> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/services/${serviceId}/features/${featureId}`;

    console.log(`[Client] Updating feature ${featureId} for service: ${serviceId}`, featureData);

    const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(featureData),
        credentials: "include",
    });

    if (!res.ok) {
        let errorMessage = "Failed to update service feature";
        try {
            const errorData: ServiceFeatureApiError = await res.json();
            errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
        } catch {
            errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
    }

    const data: ServiceFeatureResponse = await res.json();
    return data.feature;
}

/**
 * Delete a feature from a service
 */
export async function deleteServiceFeature(serviceId: string, featureId: string): Promise<void> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/services/${serviceId}/features/${featureId}`;

    console.log(`[Client] Deleting feature ${featureId} from service: ${serviceId}`);

    const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });

    if (!res.ok) {
        let errorMessage = "Failed to delete service feature";
        try {
            const errorData: ServiceFeatureApiError = await res.json();
            errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
        } catch {
            errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
    }
}

/**
 * Reorder service features
 */
export async function reorderServiceFeatures(serviceId: string, featureIds: string[]): Promise<ServiceFeature[]> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/services/${serviceId}/features/reorder`;

    console.log(`[Client] Reordering features for service: ${serviceId}`, featureIds);

    const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureIds }),
        credentials: "include",
    });

    if (!res.ok) {
        let errorMessage = "Failed to reorder service features";
        try {
            const errorData: ServiceFeatureApiError = await res.json();
            errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
        } catch {
            errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
    }

    const data: ServiceFeaturesResponse = await res.json();
    return data.features;
}

// REVIEWS API FUNCTIONS

/**
 * Fetch all reviews for a specific service
 */
export async function fetchReviewsForService(serviceId: string): Promise<Review[]> {
	const baseUrl = getBaseUrl();
	const url = `${baseUrl}/api/reviews/${serviceId}`;
	
	console.log(`[Client] Fetching reviews for service: ${serviceId}`);
	
	const res = await fetch(url, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		cache: "no-store",
		credentials: "include",
	});
	
	if (!res.ok) {
		let errorMessage = "Failed to fetch reviews";
		try {
			const errorData: ReviewApiError = await res.json();
			errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
		} catch {
			errorMessage = `HTTP ${res.status}: ${res.statusText}`;
		}
		throw new Error(errorMessage);
	}
	
	const data: ReviewsResponse = await res.json();
	if (!data.reviews) {
		throw new Error("Reviews not found in response");
	}
	return data.reviews;
}

/**
 * Submit a new review
 */
export async function submitReview(reviewData: CreateReviewData): Promise<Review> {
	const baseUrl = getBaseUrl();
	const url = `${baseUrl}/api/reviews`;
	
	console.log(`[Client] Submitting review:`, reviewData);
	
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(reviewData),
		credentials: "include",
	});
	
	if (!res.ok) {
		let errorMessage = "Failed to submit review";
		try {
			const errorData: ReviewApiError = await res.json();
			errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
		} catch {
			errorMessage = `HTTP ${res.status}: ${res.statusText}`;
		}
		throw new Error(errorMessage);
	}
	
	const data: ReviewResponse = await res.json();
	if (!data.review) {
		throw new Error("Review not found in response");
	}
	return data.review;
}

/**
 * Update an existing review
 */
export async function updateReview(reviewId: string, reviewData: UpdateReviewData): Promise<Review> {
	const baseUrl = getBaseUrl();
	const url = `${baseUrl}/api/reviews/${reviewId}`;
	
	console.log(`[Client] Updating review ${reviewId}:`, reviewData);
	
	const res = await fetch(url, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(reviewData),
		credentials: "include",
	});
	
	if (!res.ok) {
		let errorMessage = "Failed to update review";
		try {
			const errorData: ReviewApiError = await res.json();
			errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
		} catch {
			errorMessage = `HTTP ${res.status}: ${res.statusText}`;
		}
		throw new Error(errorMessage);
	}
	
	const data: ReviewResponse = await res.json();
	if (!data.review) {
		throw new Error("Review not found in response");
	}
	return data.review;
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<void> {
	const baseUrl = getBaseUrl();
	const url = `${baseUrl}/api/reviews/${reviewId}`;
	
	console.log(`[Client] Deleting review: ${reviewId}`);
	
	const res = await fetch(url, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	
	if (!res.ok) {
		let errorMessage = "Failed to delete review";
		try {
			const errorData: ReviewApiError = await res.json();
			errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
		} catch {
			errorMessage = `HTTP ${res.status}: ${res.statusText}`;
		}
		throw new Error(errorMessage);
	}
}

/**
 * Fetch review statistics for a specific service
 */
export async function fetchReviewStats(serviceId: string): Promise<{
	serviceId: string;
	totalReviews: number;
	averageRating: number;
	recentAverageRating: number;
	ratingDistribution: Array<{
		rating: number;
		count: number;
		percentage: number;
	}>;
	lastReviewDate: string | null;
}> {
	const baseUrl = getBaseUrl();
	const url = `${baseUrl}/api/reviews/${serviceId}/stats`;
	
	console.log(`[Client] Fetching review stats for service: ${serviceId}`);
	
	const res = await fetch(url, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		cache: "no-store",
		credentials: "include",
	});
	
	if (!res.ok) {
		let errorMessage = "Failed to fetch review statistics";
		try {
			const errorData: ReviewApiError = await res.json();
			errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
		} catch {
			errorMessage = `HTTP ${res.status}: ${res.statusText}`;
		}
		throw new Error(errorMessage);
	}
	
	const data = await res.json();
	return data;
}

/**
 * Server-side function to fetch review statistics directly from database
 */
export async function fetchReviewStatsServer(serviceId: string): Promise<{
	serviceId: string;
	totalReviews: number;
	averageRating: number;
	recentAverageRating: number;
	ratingDistribution: Array<{
		rating: number;
		count: number;
		percentage: number;
	}>;
	lastReviewDate: string | null;
} | null> {
	if (typeof window !== 'undefined') {
		throw new Error('fetchReviewStatsServer should only be called on the server');
	}
	
	console.log(`[Server] Fetching review stats for service: ${serviceId}`);
	
	try {
		// Verify service exists
		const service = await db.service.findUnique({
			where: { id: serviceId },
		});
		
		if (!service) {
			console.log(`[Server] Service not found for ID: ${serviceId}`);
			return null;
		}
		
		// Get all reviews for this service
		const reviews = await db.review.findMany({
			where: {
				booking: {
					serviceId: serviceId,
				},
			},
			select: {
				rating: true,
				createdAt: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		
		const totalReviews = reviews.length;
		const averageRating = totalReviews > 0 
			? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
			: 0;
		
		// Calculate rating distribution
		const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
			const rating = i + 1;
			const count = reviews.filter(r => r.rating === rating).length;
			const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
			return { rating, count, percentage };
		}).reverse();
		
		// Get recent reviews for trend analysis
		const recentReviews = reviews.slice(0, 10);
		const recentAverageRating = recentReviews.length > 0
			? recentReviews.reduce((sum, review) => sum + review.rating, 0) / recentReviews.length
			: 0;
		
		return {
			serviceId,
			totalReviews,
			averageRating: Number(averageRating.toFixed(1)),
			recentAverageRating: Number(recentAverageRating.toFixed(1)),
			ratingDistribution,
			lastReviewDate: reviews.length > 0 ? reviews[0].createdAt.toISOString() : null,
		};
		
	} catch (error) {
		console.error(`[Server] Database error fetching review stats for ID ${serviceId}:`, error);
		return null;
	}
}
