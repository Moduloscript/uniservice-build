"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useBackgroundSync() {
	const queryClient = useQueryClient();

	// Handle coming back online
	const handleOnline = useCallback(() => {
		// Resume paused mutations when coming back online
		queryClient.resumePausedMutations();

		// Refetch failed queries
		queryClient.refetchQueries({
			type: "all",
			stale: true,
		});

		toast.success("Connection restored. Syncing data...");
	}, [queryClient]);

	// Handle going offline
	const handleOffline = useCallback(() => {
		toast.warning("Connection lost. Your progress will be saved locally.");
	}, []);

	// Set up online/offline event listeners
	useEffect(() => {
		if (typeof window === "undefined") return;

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, [handleOnline, handleOffline]);

	// Set up visibility change handler for tab focus
	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleVisibilityChange = () => {
			if (!document.hidden) {
				// Tab became visible, refetch queries
				queryClient.refetchQueries({
					type: "all",
					stale: true,
				});
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			document.removeEventListener(
				"visibilitychange",
				handleVisibilityChange,
			);
		};
	}, [queryClient]);

	return {
		isOnline:
			typeof window !== "undefined" ? window.navigator.onLine : true,
	};
}
