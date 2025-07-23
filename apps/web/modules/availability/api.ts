import { apiClient } from "@/modules/shared/lib/api-client";
import type {
  ProviderAvailability,
  CreateAvailabilitySlot,
  UpdateAvailabilitySlot,
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
  params?: GetAvailabilityParams
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

  const response = await apiClient.get(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch availability: ${response.statusText}`);
  }

  const result: ApiResponse<ProviderAvailability[]> = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch availability");
  }

  return result.data;
};

// Get availability for specific service
export const getServiceAvailability = async (
  providerId: string,
  serviceId: string
): Promise<ProviderAvailability[]> => {
  const response = await apiClient.get(
    `/api/providers/${providerId}/availability/${serviceId}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch service availability: ${response.statusText}`);
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
  slot: CreateAvailabilitySlot
): Promise<ProviderAvailability> => {
  const response = await apiClient.post(
    `/api/providers/${providerId}/availability`,
    {
      body: JSON.stringify(slot),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create availability slot: ${response.statusText}`);
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
  updates: UpdateAvailabilitySlot
): Promise<ProviderAvailability> => {
  const response = await apiClient.put(
    `/api/providers/${providerId}/availability/${availabilityId}`,
    {
      body: JSON.stringify(updates),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to update availability slot: ${response.statusText}`);
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
  availabilityId: string
): Promise<void> => {
  const response = await apiClient.delete(
    `/api/providers/${providerId}/availability/${availabilityId}`
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to delete availability slot: ${response.statusText}`);
  }

  const result: ApiResponse<void> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || "Failed to delete availability slot");
  }
};

// Create multiple availability slots
export const createBulkAvailabilitySlots = async (
  providerId: string,
  slots: CreateAvailabilitySlot[]
): Promise<ProviderAvailability[]> => {
  const response = await apiClient.post(
    `/api/providers/${providerId}/availability/bulk`,
    {
      body: JSON.stringify({ slots }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create availability slots: ${response.statusText}`);
  }

  const result: ApiResponse<ProviderAvailability[]> = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to create availability slots");
  }

  return result.data;
};
