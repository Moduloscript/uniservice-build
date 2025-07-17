"use client";

import { useAuth } from "@repo/auth/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useProviderAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Check if user is authenticated
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Check if user has PROVIDER role
      if (user.userType !== "PROVIDER") {
        // Redirect based on user type
        if (user.userType === "STUDENT") {
          router.push("/app");
        } else if (user.userType === "ADMIN") {
          router.push("/app/admin");
        } else {
          router.push("/app");
        }
        return;
      }

      // Check if provider has completed onboarding
      if (!user.onboardingComplete) {
        router.push("/app/onboarding");
        return;
      }

      // Optional: Check if provider is verified
      if (!user.isVerified) {
        router.push("/app/verification-pending");
        return;
      }
    }
  }, [user, isLoading, router]);

  return {
    user,
    isLoading,
    isProvider: user?.userType === "PROVIDER",
    isAuthenticated: !!user,
    isOnboardingComplete: user?.onboardingComplete,
    isVerified: user?.isVerified,
  };
}

/**
 * Higher-order component for protecting provider routes
 */
export function withProviderAuth<T extends Record<string, any>>(
  Component: React.ComponentType<T>
) {
  return function ProtectedComponent(props: T) {
    const { user, isLoading, isProvider } = useProviderAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!user || !isProvider) {
      return null; // Redirect handled by useProviderAuth
    }

    return <Component {...props} />;
  };
}
