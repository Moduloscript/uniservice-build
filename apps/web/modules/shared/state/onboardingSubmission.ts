import { atom } from 'jotai';
import { useRouter } from 'next/navigation';
import { registerOnboarding } from '../api/onboarding';
import type { OnboardingFormValues } from '../onboarding-schema';
import { 
  hasSubmittedAtom, 
  isLoadingAtom, 
  serverErrorAtom 
} from './onboardingAtoms';

// Global submission tracker to prevent duplicate requests
let currentSubmissionPromise: Promise<any> | null = null;
let lastSubmissionData: string | null = null;

// Action atom for form submission
export const submitOnboardingAtom = atom(
  null,
  async (get, set, { data, router }: { data: OnboardingFormValues; router: ReturnType<typeof useRouter> }) => {
    const hasSubmitted = get(hasSubmittedAtom);
    const isLoading = get(isLoadingAtom);
    
    // Create a unique identifier for this submission
    const submissionId = JSON.stringify(data);
    
    // Prevent double submission with multiple checks
    if (hasSubmitted || isLoading || currentSubmissionPromise || lastSubmissionData === submissionId) {
      console.log('Duplicate submission prevented:', { hasSubmitted, isLoading, hasPending: !!currentSubmissionPromise });
      return;
    }

    // Set loading state and track submission
    set(isLoadingAtom, true);
    set(hasSubmittedAtom, true);
    set(serverErrorAtom, null);
    lastSubmissionData = submissionId;

    try {
      // Create and store the submission promise
      currentSubmissionPromise = registerOnboarding(data);
      const result = await currentSubmissionPromise;
      
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
      lastSubmissionData = null; // Clear to allow retry
    } finally {
      set(isLoadingAtom, false);
      currentSubmissionPromise = null; // Clear the promise
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
