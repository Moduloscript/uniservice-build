import type {
	ProviderAvailability,
	CreateAvailabilitySlot,
	UpdateAvailabilitySlot,
	CreateRecurringSchedule,
} from "./types";

export interface GetAvailabilityParams {
	startDate?: string;
	endDate?: string;
	serviceId?: string;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

// Get provider availability
export const getProviderAvailability = async (
	providerId: string,
	params?: GetAvailabilityParams,
): Promise<ProviderAvailability[]> => {
	const queryParams = new URLSearchParams();

	if (params?.startDate) {
		queryParams.append("startDate", params.startDate);
	}
	if (params?.endDate) {
		queryParams.append("endDate", params.endDate);
	}
	if (params?.serviceId) {
		queryParams.append("serviceId", params.serviceId);
	}

	const url = `/api/providers/${providerId}/availability${
		queryParams.toString() ? `?${queryParams.toString()}` : ""
	}`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch availability: ${response.statusText}`);
	}

	const result: ApiResponse<ProviderAvailability[]> = await response.json();

	if (!result.success) {
		throw new Error(result.error || "Failed to fetch availability");
	}
	
	if (result.data === undefined || result.data === null) {
		throw new Error("No data returned from API");
	}

	return result.data;
};

// Get availability for specific service
export const getServiceAvailability = async (
	providerId: string,
	serviceId: string,
): Promise<ProviderAvailability[]> => {
	const response = await fetch(
		`/api/providers/${providerId}/availability/${serviceId}`,
	);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch service availability: ${response.statusText}`,
		);
	}

	const result: ApiResponse<ProviderAvailability[]> = await response.json();

	if (!result.success || !result.data) {
		throw new Error(result.error || "Failed to fetch service availability");
	}

	return result.data;
};

// Create availability slot
export const createAvailabilitySlot = async (
	providerId: string,
	slot: CreateAvailabilitySlot,
): Promise<ProviderAvailability> => {
	const response = await fetch(
		`/api/providers/${providerId}/availability`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(slot),
		},
	);

	if (!response.ok) {
			const errorData = await response.json();
			
			let errorMessage = "Failed to create availability slot";
			if (typeof errorData.error === 'string') {
				errorMessage = errorData.error;
			} else if (errorData.error && typeof errorData.error === 'object') {
				// If error is an object, try to extract meaningful message
				if (errorData.error.message) {
					errorMessage = errorData.error.message;
				} else if (errorData.error.issues && Array.isArray(errorData.error.issues)) {
					// Handle Zod validation errors
					errorMessage = errorData.error.issues.map((issue: any) => `${issue.path?.join('.')}: ${issue.message}`).join(', ');
				} else {
					errorMessage = JSON.stringify(errorData.error);
				}
			} else if (errorData.message) {
				errorMessage = errorData.message;
			} else {
				errorMessage = JSON.stringify(errorData);
			}
			throw new Error(
				errorMessage ||
					`Failed to create availability slot: ${response.statusText}`,
			);
		}

	const result: ApiResponse<ProviderAvailability> = await response.json();

	if (!result.success || !result.data) {
		throw new Error(result.error || "Failed to create availability slot");
	}

	return result.data;
};

// Update availability slot
export const updateAvailabilitySlot = async (
	providerId: string,
	availabilityId: string,
	updates: UpdateAvailabilitySlot,
): Promise<ProviderAvailability> => {
	const response = await fetch(
		`/api/providers/${providerId}/availability/${availabilityId}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(updates),
		},
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			errorData.error ||
				`Failed to update availability slot: ${response.statusText}`,
		);
	}

	const result: ApiResponse<ProviderAvailability> = await response.json();

	if (!result.success || !result.data) {
		throw new Error(result.error || "Failed to update availability slot");
	}

	return result.data;
};

// Delete availability slot
export const deleteAvailabilitySlot = async (
	providerId: string,
	availabilityId: string,
): Promise<void> => {
	const response = await fetch(
		`/api/providers/${providerId}/availability/${availabilityId}`,
		{
			method: "DELETE",
		},
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			errorData.error ||
				`Failed to delete availability slot: ${response.statusText}`,
		);
	}

	const result: ApiResponse<void> = await response.json();

	if (!result.success) {
		throw new Error(result.error || "Failed to delete availability slot");
	}
};

// Create multiple availability slots
export const createBulkAvailabilitySlots = async (
	providerId: string,
	slots: CreateAvailabilitySlot[],
): Promise<ProviderAvailability[]> => {
	const response = await fetch(
		`/api/providers/${providerId}/availability/bulk`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ slots }),
		},
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			errorData.error ||
				`Failed to create availability slots: ${response.statusText}`,
		);
	}

	const result: ApiResponse<ProviderAvailability[]> = await response.json();

	if (!result.success || !result.data) {
		throw new Error(result.error || "Failed to create availability slots");
	}

	return result.data;
};

// Create recurring schedule
export const createRecurringSchedule = async (
	providerId: string,
	schedule: CreateRecurringSchedule,
): Promise<ProviderAvailability[]> => {
	const response = await fetch(
		`/api/providers/${providerId}/availability/recurring`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(schedule),
		},
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			errorData.error ||
				`Failed to create recurring schedule: ${response.statusText}`,
		);
	}

	const result: ApiResponse<ProviderAvailability[]> = await response.json();

	if (!result.success || !result.data) {
		throw new Error(result.error || "Failed to create recurring schedule");
	}

	return result.data;
};
