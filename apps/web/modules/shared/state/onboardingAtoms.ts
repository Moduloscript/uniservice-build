import { atom } from 'jotai';
import type { ProviderCategory } from '../onboarding-schema';

// Atoms for onboarding form states
export const stepAtom = atom(0);
export const providerCategoryAtom = atom<ProviderCategory | undefined>(undefined);
export const isLoadingAtom = atom(false);
export const serverErrorAtom = atom<string | null>(null);

// Atom to prevent double submissions
export const hasSubmittedAtom = atom(false);

// Derived atom to check if submission is disabled
// Note: We'll need to pass form validity from the component since atoms can't access React Hook Form state
export const isSubmitDisabledAtom = atom((get) => {
  const isLoading = get(isLoadingAtom);
  const hasSubmitted = get(hasSubmittedAtom);
  return isLoading || hasSubmitted;
});

// Action atom to update form validity
export const formValidityAtom = atom(true);

// Combined submit disabled atom that includes form validity
export const combinedSubmitDisabledAtom = atom((get) => {
  const isLoading = get(isLoadingAtom);
  const hasSubmitted = get(hasSubmittedAtom);
  const isFormValid = get(formValidityAtom);
  return isLoading || hasSubmitted || !isFormValid;
});
