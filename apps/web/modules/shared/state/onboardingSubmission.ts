import { atom } from 'jotai';
import { useRouter } from 'next/navigation';
import { registerOnboarding } from '../api/onboarding';
import type { OnboardingFormValues } from '../onboarding-schema';
import { 
  hasSubmittedAtom, 
  isLoadingAtom, 
  serverErrorAtom 
} from './onboardingAtoms';

// Action atom for form submission
export const submitOnboardingAtom = atom(
  null,
  async (get, set, { data, router }: { data: OnboardingFormValues; router: ReturnType<typeof useRouter> }) => {
    const hasSubmitted = get(hasSubmittedAtom);
    const isLoading = get(isLoadingAtom);
    
    // Prevent double submission
    if (hasSubmitted || isLoading) {
      return;
    }

    // Set loading state
    set(isLoadingAtom, true);
    set(hasSubmittedAtom, true);
    set(serverErrorAtom, null);

    try {
      const result = await registerOnboarding(data);
      
      if (!result.ok) {
        // Reset submission state on error to allow retry
        set(hasSubmittedAtom, false);
        
        if (result.status === 409) {
          set(serverErrorAtom, "This matriculation number is already registered");
        } else if (result.status === 401) {
          router.push("/auth/login");
        } else {
          set(serverErrorAtom, result.error || "Registration failed. Please try again later.");
        }
        return;
      }
      
      // Don't reset hasSubmitted on success - keep it true to prevent re-submission
      router.push("/app");
    } catch (e) {
      // Reset submission state on error to allow retry
      set(hasSubmittedAtom, false);
      set(serverErrorAtom, "Network error");
    } finally {
      set(isLoadingAtom, false);
    }
  }
);

// Action atom to reset form state (useful for retries)
export const resetSubmissionStateAtom = atom(
  null,
  (get, set) => {
    set(hasSubmittedAtom, false);
    set(isLoadingAtom, false);
    set(serverErrorAtom, null);
  }
);
