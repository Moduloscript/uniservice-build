/**
 * Formats error messages to handle various error types consistently
 * This prevents "[object Object]" errors from being displayed to users
 */
export function formatErrorMessage(
	error: unknown,
	fallbackMessage = "An error occurred",
): string {
	// Handle Error instances
	if (error instanceof Error) {
		return error.message;
	}

	// Handle string errors
	if (typeof error === "string") {
		return error;
	}

	// Handle objects with message property
	if (error && typeof error === "object" && "message" in error) {
		const message = (error as { message: unknown }).message;
		if (typeof message === "string") {
			return message;
		}
	}

	// Handle API error responses
	if (error && typeof error === "object" && "error" in error) {
		const errorProp = (error as { error: unknown }).error;
		if (typeof errorProp === "string") {
			return errorProp;
		}
	}

	// Try to stringify the error as a last resort
	try {
		if (error && typeof error === "object") {
			const stringified = JSON.stringify(error);
			if (stringified && stringified !== "{}") {
				return stringified;
			}
		}
	} catch {
		// If JSON.stringify fails, ignore and fall back
	}

	// Final fallback
	return fallbackMessage;
}
