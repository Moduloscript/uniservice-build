"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { fetchServiceFeatures } from "../api";
import type { ServiceFeature } from "../types/service-feature";
import { formatErrorMessage } from "../utils/error-formatting";

interface ServiceFeaturesProps {
    serviceId: string;
    className?: string;
}

export function ServiceFeatures({ serviceId, className = "" }: ServiceFeaturesProps) {
    const {
        data: features = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["service-features", serviceId],
        queryFn: () => fetchServiceFeatures(serviceId),
        enabled: !!serviceId,
        staleTime: 30 * 1000, // 30 seconds
        retry: 2,
    });

    if (isLoading) {
        return (
            <div className={`bg-white rounded-lg border p-6 ${className}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Loading features...</h3>
                </div>
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                                <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-900">Error Loading Features</h3>
                </div>
                <p className="text-red-700">
                    {formatErrorMessage(error, "Failed to load service features")}
                </p>
            </div>
        );
    }

    if (features.length === 0) {
        return (
            <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">What's Included</h3>
                </div>
                <p className="text-gray-600">No features have been added to this service yet.</p>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg border p-6 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">What's Included</h3>
            </div>
            <div className="space-y-3">
                {features.map((feature: ServiceFeature) => (
                    <div key={feature.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-900">{feature.title}</div>
                            {feature.description && (
                                <div className="text-sm text-gray-600 mt-1">{feature.description}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface ServiceFeaturesServerProps {
    features: ServiceFeature[];
    className?: string;
}

// Server-side version that takes features as props (for SSR)
export function ServiceFeaturesServer({ features, className = "" }: ServiceFeaturesServerProps) {
    if (features.length === 0) {
        return (
            <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">What's Included</h3>
                </div>
                <p className="text-gray-600">No features have been added to this service yet.</p>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg border p-6 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">What's Included</h3>
            </div>
            <div className="space-y-3">
                {features.map((feature: ServiceFeature) => (
                    <div key={feature.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-900">{feature.title}</div>
                            {feature.description && (
                                <div className="text-sm text-gray-600 mt-1">{feature.description}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
