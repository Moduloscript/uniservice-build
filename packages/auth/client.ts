import {
	adminClient,
	inferAdditionalFields,
	magicLinkClient,
	organizationClient,
	passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from ".";

export const authClient = createAuthClient({
	plugins: [
		inferAdditionalFields<typeof auth>(),
		magicLinkClient(),
		organizationClient(),
		adminClient(),
		passkeyClient(),
	],
});

// Export useAuth hook for easier usage
export const useAuth = () => {
	const session = authClient.useSession();
	return {
		user: session.data?.user || null,
		session: session.data?.session || null,
		isLoading: session.isPending,
		error: session.error,
		refetch: session.refetch,
	};
};

export type AuthClientErrorCodes = typeof authClient.$ERROR_CODES & {
	INVALID_INVITATION: string;
};
