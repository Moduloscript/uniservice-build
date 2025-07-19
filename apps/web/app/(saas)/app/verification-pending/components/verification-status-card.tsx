"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Button } from "@ui/components/button";
import { AlertCircle, CheckCircle, Clock, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface VerificationStatus {
  user: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    isVerified: boolean;
    verificationStatus: string | null;
    verificationNotes: string | null;
    verificationReviewedAt: string | null;
    verificationReviewedBy: string | null;
    createdAt: string;
    userType: string | null;
  };
  status: string;
  message: string;
}

const fetchVerificationStatus = async (): Promise<VerificationStatus> => {
  const res = await fetch("/api/user/verification-status");
  if (!res.ok) {
    throw new Error("Failed to fetch verification status");
  }
  return res.json();
};

export function VerificationStatusCard({ userId }: { userId: string }) {
  const {
    data: verificationData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery<VerificationStatus, Error>({
    queryKey: ["user-verification-status", userId],
    queryFn: fetchVerificationStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: false,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-6 w-6 text-red-600" />;
      case "PENDING":
      default:
        return <Clock className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 bg-green-50 border-green-200";
      case "REJECTED":
        return "text-red-600 bg-red-50 border-red-200";
      case "PENDING":
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            Loading Verification Status...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please wait while we check your verification status.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-600" />
            Error Loading Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Unable to load your verification status. Please try again.
          </p>
          <Button onClick={() => refetch()} disabled={isRefetching}>
            {isRefetching ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              "Try Again"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!verificationData) {
    return null;
  }

  const { user, status, message } = verificationData;

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getStatusIcon(status)}
            Account Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Badge */}
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
              status
            )}`}
          >
            Status: {status}
          </div>

          {/* Status Message */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm">{message}</p>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Name:</span>
              <p>{user.name}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Email:</span>
              <p>{user.email}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">User Type:</span>
              <p className="capitalize">{user.userType?.toLowerCase()}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Submitted:</span>
              <p>{format(new Date(user.createdAt), "PPP")}</p>
            </div>
          </div>

          {/* Review Details (if available) */}
          {user.verificationReviewedAt && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium">Review Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Reviewed At:</span>
                  <p>{format(new Date(user.verificationReviewedAt), "PPP 'at' pp")}</p>
                </div>
                {user.verificationReviewedBy && (
                  <div>
                    <span className="font-medium text-muted-foreground">Reviewed By:</span>
                    <p>Admin Team</p>
                  </div>
                )}
              </div>
              {user.verificationNotes && (
                <div>
                  <span className="font-medium text-muted-foreground">Notes:</span>
                  <div className="mt-1 p-3 bg-muted/50 rounded text-sm">
                    {user.verificationNotes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={isRefetching}
            >
              {isRefetching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </>
              )}
            </Button>

            {status === "APPROVED" && (
              <Button asChild>
                <Link href="/app">Continue to Dashboard</Link>
              </Button>
            )}

            {status === "REJECTED" && (
              <Button asChild variant="outline">
                <Link href="/app/onboarding">Update Information</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What happens next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {status === "PENDING" && (
            <div className="space-y-2">
              <p>🔍 Our admin team is reviewing your account and documents</p>
              <p>📧 You'll receive an email notification once the review is complete</p>
              <p>⏱️ This process usually takes 1-2 business days</p>
              <p>🔄 This page will automatically refresh every 30 seconds</p>
            </div>
          )}
          {status === "APPROVED" && (
            <div className="space-y-2">
              <p>🎉 Congratulations! Your account has been verified</p>
              <p>✅ You now have full access to all platform features</p>
              <p>🚀 Click "Continue to Dashboard" to get started</p>
            </div>
          )}
          {status === "REJECTED" && (
            <div className="space-y-2">
              <p>⚠️ Your verification was not approved</p>
              <p>📝 Please review the notes above for specific feedback</p>
              <p>🔄 You can update your information and resubmit</p>
              <p>💬 Contact support if you need assistance</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
