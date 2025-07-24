import { useCallback, useRef } from "react";

/**
 * Hook to debounce function calls
 * Prevents rapid successive calls to the same function
 *
 * @param callback The function to debounce
 * @param delay The delay in milliseconds (default: 1000ms)
 * @returns A debounced version of the callback
 */
export function useDebounce<T extends (...args: any[]) => any>(
	callback: T,
	delay = 1000,
): (...args: Parameters<T>) => void {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const pendingRef = useRef(false);

	const debouncedCallback = useCallback(
		(...args: Parameters<T>) => {
			// If we're already pending, ignore this call
			if (pendingRef.current) {
				console.warn("[useDebounce] Ignoring rapid successive call");
				return;
			}

			// Set pending flag
			pendingRef.current = true;

			// Clear any existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// Execute the callback immediately
			callback(...args);

			// Set timeout to clear pending flag
			timeoutRef.current = setTimeout(() => {
				pendingRef.current = false;
			}, delay);
		},
		[callback, delay],
	);

	return debouncedCallback;
}

/**
 * Hook to prevent form double submission
 *
 * @param onSubmit The form submission handler
 * @param options Configuration options
 * @returns A wrapped submission handler that prevents double submission
 */
export function usePreventDoubleSubmit<T extends (...args: any[]) => any>(
	onSubmit: T,
	options: {
		delay?: number;
		onDoubleSubmit?: () => void;
	} = {},
): T {
	const { delay = 2000, onDoubleSubmit } = options;
	const isSubmittingRef = useRef(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const wrappedSubmit = useCallback(
		((...args: Parameters<T>) => {
			if (isSubmittingRef.current) {
				console.warn(
					"[usePreventDoubleSubmit] Preventing double submission",
				);
				onDoubleSubmit?.();
				return;
			}

			// Set submitting flag
			isSubmittingRef.current = true;

			// Clear any existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// Call the original submit function
			const result = onSubmit(...args);

			// Handle both sync and async submissions
			if (result instanceof Promise) {
				result.finally(() => {
					// Reset after a delay to prevent rapid resubmission
					timeoutRef.current = setTimeout(() => {
						isSubmittingRef.current = false;
					}, delay);
				});
			} else {
				// For sync submissions, reset after delay
				timeoutRef.current = setTimeout(() => {
					isSubmittingRef.current = false;
				}, delay);
			}

			return result;
		}) as T,
		[onSubmit, delay, onDoubleSubmit],
	);

	return wrappedSubmit;
}
