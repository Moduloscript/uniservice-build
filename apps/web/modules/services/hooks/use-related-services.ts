import { useQuery } from "@tanstack/react-query";
import { fetchServices } from "../api";
import type { Service } from "../types";

interface UseRelatedServicesOptions {
  currentServiceId: string;
  providerId?: string;
  categoryId?: string;
}

export function useRelatedServices({ currentServiceId, providerId, categoryId }: UseRelatedServicesOptions) {
  return useQuery({
    queryKey: ["services", "related", { providerId, categoryId }],
    queryFn: () => fetchServices({ providerId, categoryId }),
    select: (services: Service[]) => services.filter(service => service.id !== currentServiceId),
    staleTime: 30 * 1000, // 30 seconds
  });
}
