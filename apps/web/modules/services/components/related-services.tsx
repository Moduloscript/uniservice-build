"use client";

import { ServiceList } from "../service-list";
import { useRelatedServices } from "../hooks/use-related-services";
import type { Service } from "../types";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../ui/components/card";
import { Loader2 } from "lucide-react";

interface RelatedServicesProps {
	currentService: Service;
	type: "provider" | "category";
	maxItems?: number;
}

export function RelatedServices({
	currentService,
	type,
	maxItems = 4,
}: RelatedServicesProps) {
	const {
		data: relatedServices,
		isLoading,
		error,
	} = useRelatedServices({
		currentServiceId: currentService.id,
		providerId: type === "provider" ? currentService.providerId : undefined,
		categoryId: type === "category" ? currentService.categoryId : undefined,
	});

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-lg">
					{type === "provider"
						? "More services by this provider"
						: "Similar services in this category"}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{isLoading && (
					<div className="flex items-center justify-center py-4">
						<Loader2 className="animate-spin text-primary h-6 w-6" />
					</div>
				)}
				{error && (
					<div className="text-red-500 text-sm">
						Error loading related services
					</div>
				)}
				{relatedServices && relatedServices.length > 0 ? (
					<ServiceList
						services={relatedServices.slice(0, maxItems)}
						className="grid grid-cols-1 sm:grid-cols-2 gap-6"
					/>
				) : !isLoading && !error ? (
					<div className="text-muted-foreground text-sm text-center py-8">
						No related services found
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
