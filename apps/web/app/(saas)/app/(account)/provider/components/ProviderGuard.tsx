"use client";

import { useProviderAuth } from "../hooks/useProviderAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Button } from "@ui/components/button";
import { AlertCircle, Loader2, Shield, UserCheck } from "lucide-react";
import Link from "next/link";

interface ProviderGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProviderGuard({ children, fallback }: ProviderGuardProps) {
  const { user, isLoading, isProvider, isAuthenticated, isOnboardingComplete, isVerified } = useProviderAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Verifying access...</p>
            <p className="text-sm text-muted-foreground">Please wait while we check your permissions</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You must be logged in to access the provider dashboard.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not a provider
  if (!isProvider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This area is only accessible to service providers. 
              {user?.userType === 'STUDENT' ? ' Students can browse services from the main app.' : ''}
            </p>
            <Button asChild className="w-full">
              <Link href="/app">
                Go to Main App
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Onboarding not complete
  if (!isOnboardingComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Complete Your Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Please complete your provider onboarding before accessing the dashboard.
            </p>
            <Button asChild className="w-full">
              <Link href="/app/onboarding">
                Continue Onboarding
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not verified (optional check)
  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Verification Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your provider account is pending verification. You can access limited features while we review your application.
            </p>
            <Button asChild className="w-full">
              <Link href="/app/verification-pending">
                Check Status
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed - render children
  return <>{children}</>;
}

/**
 * Simple loading component for route guards
 */
export function RouteGuardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
