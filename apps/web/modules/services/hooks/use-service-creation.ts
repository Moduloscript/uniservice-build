import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createService } from "../api";
import { toast } from "sonner";

export interface CreateServiceData {
	name: string;
	description: string;
	price: number;
	duration: number;
	categoryId: string;
}

export function useServiceCreation() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: createService,
		onSuccess: (data) => {
			toast.success("Service created successfully!");

			// Invalidate and refetch relevant queries
			queryClient.invalidateQueries({ queryKey: ["provider-services"] });
			queryClient.invalidateQueries({
				queryKey: ["provider-dashboard-stats"],
			});
			queryClient.invalidateQueries({ queryKey: ["services"] });

			// Redirect to the service management page
			router.push("/app/provider/services");
		},
		onError: (error) => {
			console.error("Failed to create service:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create service. Please try again.",
			);
		},
	});
}
