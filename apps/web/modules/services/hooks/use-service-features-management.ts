import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	fetchServiceFeatures,
	addServiceFeature,
	updateServiceFeature,
	deleteServiceFeature,
	reorderServiceFeatures,
} from "../api";
import type {
	ServiceFeature,
	CreateServiceFeatureData,
	UpdateServiceFeatureData,
} from "../types/service-feature";
import { toast } from "sonner";

/**
 * Hook for fetching service features with management capabilities
 */
export function useServiceFeaturesManagement(serviceId: string) {
	const queryClient = useQueryClient();
	const queryKey = ["service-features", serviceId];

	// Fetch features
	const {
		data: features = [],
		isLoading,
		error,
	} = useQuery({
		queryKey,
		queryFn: () => fetchServiceFeatures(serviceId),
		enabled: !!serviceId,
		staleTime: 30 * 1000,
	});

	// Add feature mutation
	const addFeatureMutation = useMutation({
		mutationFn: (data: CreateServiceFeatureData) =>
			addServiceFeature(serviceId, data),
		onSuccess: (newFeature) => {
			queryClient.setQueryData(queryKey, (old: ServiceFeature[] = []) => [
				...old,
				newFeature,
			]);
			toast.success("Feature added successfully!");
		},
		onError: (error) => {
			console.error("Failed to add feature:", error);
			toast.error("Failed to add feature. Please try again.");
		},
	});

	// Update feature mutation
	const updateFeatureMutation = useMutation({
		mutationFn: ({
			featureId,
			data,
		}: {
			featureId: string;
			data: UpdateServiceFeatureData;
		}) => updateServiceFeature(serviceId, featureId, data),
		onSuccess: (updatedFeature) => {
			queryClient.setQueryData(queryKey, (old: ServiceFeature[] = []) =>
				old.map((feature) =>
					feature.id === updatedFeature.id ? updatedFeature : feature,
				),
			);
			toast.success("Feature updated successfully!");
		},
		onError: (error) => {
			console.error("Failed to update feature:", error);
			toast.error("Failed to update feature. Please try again.");
		},
	});

	// Delete feature mutation
	const deleteFeatureMutation = useMutation({
		mutationFn: (featureId: string) =>
			deleteServiceFeature(serviceId, featureId),
		onSuccess: (_, featureId) => {
			queryClient.setQueryData(queryKey, (old: ServiceFeature[] = []) =>
				old.filter((feature) => feature.id !== featureId),
			);
			toast.success("Feature deleted successfully!");
		},
		onError: (error) => {
			console.error("Failed to delete feature:", error);
			toast.error("Failed to delete feature. Please try again.");
		},
	});

	// Reorder features mutation
	const reorderFeaturesMutation = useMutation({
		mutationFn: (featureIds: string[]) =>
			reorderServiceFeatures(serviceId, featureIds),
		onSuccess: (reorderedFeatures) => {
			queryClient.setQueryData(queryKey, reorderedFeatures);
			toast.success("Features reordered successfully!");
		},
		onError: (error) => {
			console.error("Failed to reorder features:", error);
			toast.error("Failed to reorder features. Please try again.");
		},
	});

	return {
		// Data
		features,
		isLoading,
		error,

		// Mutations
		addFeature: addFeatureMutation.mutate,
		updateFeature: updateFeatureMutation.mutate,
		deleteFeature: deleteFeatureMutation.mutate,
		reorderFeatures: reorderFeaturesMutation.mutate,

		// Loading states
		isAdding: addFeatureMutation.isPending,
		isUpdating: updateFeatureMutation.isPending,
		isDeleting: deleteFeatureMutation.isPending,
		isReordering: reorderFeaturesMutation.isPending,

		// Helper function to check if any operation is pending
		isAnyPending:
			addFeatureMutation.isPending ||
			updateFeatureMutation.isPending ||
			deleteFeatureMutation.isPending ||
			reorderFeaturesMutation.isPending,
	};
}
