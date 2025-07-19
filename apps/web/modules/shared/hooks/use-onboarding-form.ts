"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { onboardingSchema, type OnboardingFormValues } from '../onboarding-schema';
import { registerOnboarding } from '../api/onboarding';

const ONBOARDING_DRAFT_KEY = 'onboarding-draft';
const DRAFT_SAVE_DELAY = 1500; // 1.5 seconds delay for auto-save

// Helper to safely access localStorage
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently fail if localStorage is not available
  }
};

const removeLocalStorageItem = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail if localStorage is not available
  }
};

export function useOnboardingForm() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Load draft from localStorage
  const { data: draftData } = useQuery({
    queryKey: [ONBOARDING_DRAFT_KEY],
    queryFn: () => {
      const saved = getLocalStorageItem(ONBOARDING_DRAFT_KEY);
      if (!saved) return null;
      
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    },
    staleTime: Infinity, // Draft data doesn't go stale
    gcTime: Infinity, // Keep in cache indefinitely
  });

  // Initialize form with draft data
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      userType: undefined,
      matricNumber: "",
      department: "",
      level: undefined,
      verificationDoc: "",
      studentIdCard: "",
      providerCategory: undefined,
      providerDocs: {},
    },
    mode: "onChange",
  });

  // Load draft data into form when available
  useEffect(() => {
    if (draftData && Object.keys(draftData).length > 0) {
      // Only reset if form is in its initial state
      const currentValues = form.getValues();
      const hasCurrentData = Object.values(currentValues).some(value => 
        value !== undefined && value !== "" && 
        (typeof value === 'object' ? Object.keys(value).length > 0 : true)
      );
      
      if (!hasCurrentData) {
        form.reset(draftData);
      }
    }
  }, [draftData, form]);

  // Auto-save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (data: Partial<OnboardingFormValues>) => {
      const serializedData = JSON.stringify(data);
      setLocalStorageItem(ONBOARDING_DRAFT_KEY, serializedData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([ONBOARDING_DRAFT_KEY], data);
    },
    onError: (error) => {
      console.warn('Failed to save draft:', error);
      // Don't show toast for draft save failures to avoid noise
    }
  });

  // Submit onboarding mutation
  const submitOnboardingMutation = useMutation({
    mutationFn: registerOnboarding,
    onSuccess: (result) => {
      if (result.ok) {
        // Clear draft on successful submission
        removeLocalStorageItem(ONBOARDING_DRAFT_KEY);
        queryClient.removeQueries({ queryKey: [ONBOARDING_DRAFT_KEY] });
        
        // Invalidate user session to reload with updated user data
        queryClient.invalidateQueries({ queryKey: ['user-session'] });
        queryClient.invalidateQueries({ queryKey: ['session'] });
        
        toast.success('Onboarding completed successfully!');
        router.push('/app');
      } else {
        // Handle API errors
        if (result.status === 409) {
          form.setError('matricNumber', {
            message: 'This matriculation number is already registered'
          });
          toast.error('This matriculation number is already registered');
        } else if (result.status === 401) {
          toast.error('Session expired. Please log in again.');
          router.push('/auth/login');
        } else {
          const errorMessage = result.error || 'Onboarding failed. Please try again.';
          toast.error(errorMessage);
          form.setError('root', { message: errorMessage });
        }
      }
    },
    onError: (error: any) => {
      console.error('Onboarding error:', error);
      const errorMessage = error.message || 'Network error. Please check your connection and try again.';
      toast.error(errorMessage);
      form.setError('root', { message: errorMessage });
    }
  });

  // Debounced auto-save function
  const debouncedSaveDraft = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      
      return (data: Partial<OnboardingFormValues>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // Only save if there's meaningful data
          const hasData = Object.values(data).some(value => {
            if (value === undefined || value === null || value === '') return false;
            if (typeof value === 'object' && Object.keys(value).length === 0) return false;
            return true;
          });
          
          if (hasData) {
            saveDraftMutation.mutate(data);
          }
        }, DRAFT_SAVE_DELAY);
      };
    })(),
    [saveDraftMutation]
  );

  // Watch form changes and auto-save
  useEffect(() => {
    const subscription = form.watch((data) => {
      debouncedSaveDraft(data as Partial<OnboardingFormValues>);
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, debouncedSaveDraft]);

  // Clear draft function
  const clearDraft = useCallback(() => {
    removeLocalStorageItem(ONBOARDING_DRAFT_KEY);
    queryClient.removeQueries({ queryKey: [ONBOARDING_DRAFT_KEY] });
    queryClient.setQueryData([ONBOARDING_DRAFT_KEY], null);
  }, [queryClient]);

  // Submit function
  const submitOnboarding = useCallback(
    (data: OnboardingFormValues) => {
      submitOnboardingMutation.mutate(data);
    },
    [submitOnboardingMutation.mutate]
  );

  return {
    form,
    submitOnboarding,
    isSubmitting: submitOnboardingMutation.isPending,
    isDraftSaving: saveDraftMutation.isPending,
    hasDraft: !!draftData,
    clearDraft,
    // Additional state for better UX
    submitError: submitOnboardingMutation.error,
    isSuccess: submitOnboardingMutation.isSuccess,
  };
}
