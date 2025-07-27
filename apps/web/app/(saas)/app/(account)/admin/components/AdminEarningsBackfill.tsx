"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@ui/components/card";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import { Badge } from "@ui/components/badge";
import { Skeleton } from "@ui/components/skeleton";
import { 
  PlayIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertTriangleIcon,
  ClockIcon,
  DatabaseIcon 
} from "lucide-react";

interface BackfillSummary {
  totalFound: number;
  processed: number;
  errors: number;
  duration: number;
}

interface BackfillError {
  bookingId: string;
  error: string;
}

interface BackfillResponse {
  message: string;
  summary: BackfillSummary;
  errors?: BackfillError[];
}

export function AdminEarningsBackfill() {
  const [lastResult, setLastResult] = useState<BackfillResponse | null>(null);

  const backfillMutation = useMutation({
    mutationFn: async (): Promise<BackfillResponse> => {
      const response = await fetch("/api/admin/earnings/backfill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      setLastResult(data);
    },
    onError: (error) => {
      console.error("Backfill failed:", error);
      setLastResult({
        message: `Backfill failed: ${error.message}`,
        summary: {
          totalFound: 0,
          processed: 0,
          errors: 1,
          duration: 0,
        },
      });
    },
  });

  const handleStartBackfill = () => {
    backfillMutation.mutate();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Main Backfill Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            Earnings Backfill Process
          </CardTitle>
          <CardDescription>
            Process completed bookings that are missing earnings records. This will create 
            earnings entries for any completed bookings that don't have associated earnings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleStartBackfill}
              disabled={backfillMutation.isPending}
              className="flex items-center gap-2"
            >
              {backfillMutation.isPending ? (
                <>
                  <ClockIcon className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4" />
                  Start Backfill Process
                </>
              )}
            </Button>

            {backfillMutation.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Skeleton className="h-4 w-4 rounded-full" />
                Scanning for missing earnings records...
              </div>
            )}
          </div>

          {/* Loading State */}
          {backfillMutation.isPending && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {/* Results Section */}
          {lastResult && !backfillMutation.isPending && (
            <div className="space-y-4">
              {/* Status Alert */}
              {lastResult.summary.errors === 0 ? (
                <Alert variant="success">
                  <CheckCircleIcon className="h-4 w-4" />
                  <AlertTitle>Backfill Completed Successfully</AlertTitle>
                  <AlertDescription>{lastResult.message}</AlertDescription>
                </Alert>
              ) : lastResult.summary.processed > 0 ? (
                <Alert variant="primary">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Backfill Completed with Some Errors</AlertTitle>
                  <AlertDescription>{lastResult.message}</AlertDescription>
                </Alert>
              ) : (
                <Alert variant="error">
                  <XCircleIcon className="h-4 w-4" />
                  <AlertTitle>Backfill Failed</AlertTitle>
                  <AlertDescription>{lastResult.message}</AlertDescription>
                </Alert>
              )}

              {/* Summary Statistics */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-700">
                      {lastResult.summary.totalFound}
                    </div>
                    <div className="text-sm text-blue-600">Bookings Found</div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-700">
                      {lastResult.summary.processed}
                    </div>
                    <div className="text-sm text-green-600">Successfully Processed</div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50/50">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-700">
                      {lastResult.summary.errors}
                    </div>
                    <div className="text-sm text-red-600">Errors</div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-gray-50/50">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-gray-700">
                      {formatDuration(lastResult.summary.duration)}
                    </div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </CardContent>
                </Card>
              </div>

              {/* Success Rate Badge */}
              {lastResult.summary.totalFound > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Success Rate:</span>
                  <Badge 
                    variant={
                      lastResult.summary.errors === 0 
                        ? "default" 
                        : lastResult.summary.processed > lastResult.summary.errors 
                        ? "secondary" 
                        : "destructive"
                    }
                  >
                    {((lastResult.summary.processed / lastResult.summary.totalFound) * 100).toFixed(1)}%
                  </Badge>
                </div>
              )}

              {/* Error Details */}
              {lastResult.errors && lastResult.errors.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                      <XCircleIcon className="h-4 w-4" />
                      Error Details ({lastResult.errors.length} errors)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {lastResult.errors.slice(0, 10).map((error, index) => (
                        <div 
                          key={error.bookingId} 
                          className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-400"
                        >
                          <div className="font-medium">Booking ID: {error.bookingId}</div>
                          <div className="text-red-600">{error.error}</div>
                        </div>
                      ))}
                      {lastResult.errors.length > 10 && (
                        <div className="text-sm text-muted-foreground italic">
                          ... and {lastResult.errors.length - 10} more errors
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-amber-700 flex items-center gap-2">
            <AlertTriangleIcon className="h-4 w-4" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>• This process only affects bookings with status "COMPLETED"</div>
          <div>• Existing earnings records will not be modified or duplicated</div>
          <div>• The process is safe to run multiple times</div>
          <div>• Large datasets may take several minutes to process</div>
          <div>• Any errors will be logged for investigation</div>
        </CardContent>
      </Card>
    </div>
  );
}
