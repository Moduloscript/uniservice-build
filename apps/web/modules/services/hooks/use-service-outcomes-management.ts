import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  fetchServiceOutcomes, 
  addServiceOutcome, 
  updateServiceOutcome, 
  deleteServiceOutcome,
  reorderServiceOutcomes 
} from "../api";
import type { 
  ServiceOutcome, 
  CreateServiceOutcomeData, 
  UpdateServiceOutcomeData 
} from "../types/service-outcome";
import { toast } from "sonner";

/**
 * Hook for fetching service outcomes with management capabilities
 */
export function useServiceOutcomesManagement(serviceId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["service-outcomes", serviceId];

  // Fetch outcomes
  const { data: outcomes = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchServiceOutcomes(serviceId),
    enabled: !!serviceId,
    staleTime: 30 * 1000,
  });

  // Add outcome mutation
  const addOutcomeMutation = useMutation({
    mutationFn: (data: CreateServiceOutcomeData) => 
      addServiceOutcome(serviceId, data),
    onSuccess: (newOutcome) => {
      queryClient.setQueryData(queryKey, (old: ServiceOutcome[] = []) => [
        ...old,
        newOutcome,
      ]);
      toast.success("Learning outcome added successfully!");
    },
    onError: (error) => {
      console.error("Failed to add outcome:", error);
      toast.error("Failed to add learning outcome. Please try again.");
    },
  });

  // Update outcome mutation
  const updateOutcomeMutation = useMutation({
    mutationFn: ({ outcomeId, data }: { 
      outcomeId: string; 
      data: UpdateServiceOutcomeData; 
    }) => updateServiceOutcome(serviceId, outcomeId, data),
    onSuccess: (updatedOutcome) => {
      queryClient.setQueryData(queryKey, (old: ServiceOutcome[] = []) =>
        old.map((outcome) =>
          outcome.id === updatedOutcome.id ? updatedOutcome : outcome
        )
      );
      toast.success("Learning outcome updated successfully!");
    },
    onError: (error) => {
      console.error("Failed to update outcome:", error);
      toast.error("Failed to update learning outcome. Please try again.");
    },
  });

  // Delete outcome mutation
  const deleteOutcomeMutation = useMutation({
    mutationFn: (outcomeId: string) => 
      deleteServiceOutcome(serviceId, outcomeId),
    onSuccess: (_, outcomeId) => {
      queryClient.setQueryData(queryKey, (old: ServiceOutcome[] = []) =>
        old.filter((outcome) => outcome.id !== outcomeId)
      );
      toast.success("Learning outcome deleted successfully!");
    },
    onError: (error) => {
      console.error("Failed to delete outcome:", error);
      toast.error("Failed to delete learning outcome. Please try again.");
    },
  });

  // Reorder outcomes mutation
  const reorderOutcomesMutation = useMutation({
    mutationFn: (outcomeIds: string[]) => 
      reorderServiceOutcomes(serviceId, outcomeIds),
    onSuccess: (reorderedOutcomes) => {
      queryClient.setQueryData(queryKey, reorderedOutcomes);
      toast.success("Learning outcomes reordered successfully!");
    },
    onError: (error) => {
      console.error("Failed to reorder outcomes:", error);
      toast.error("Failed to reorder learning outcomes. Please try again.");
    },
  });

  return {
    // Data
    outcomes,
    isLoading,
    error,
    
    // Mutations
    addOutcome: addOutcomeMutation.mutate,
    updateOutcome: updateOutcomeMutation.mutate,
    deleteOutcome: deleteOutcomeMutation.mutate,
    reorderOutcomes: reorderOutcomesMutation.mutate,
    
    // Loading states
    isAdding: addOutcomeMutation.isPending,
    isUpdating: updateOutcomeMutation.isPending,
    isDeleting: deleteOutcomeMutation.isPending,
    isReordering: reorderOutcomesMutation.isPending,
    
    // Helper function to check if any operation is pending
    isAnyPending: 
      addOutcomeMutation.isPending ||
      updateOutcomeMutation.isPending ||
      deleteOutcomeMutation.isPending ||
      reorderOutcomesMutation.isPending,
  };
}
