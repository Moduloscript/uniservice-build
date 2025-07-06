"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ServiceList } from "./service-list";
import { CategoryFilter } from "./category-filter";
import { ServiceSearch } from "./service-search";
import { ServiceSort } from "./service-sort";
import { fetchServices } from "./api";
import { fetchServiceCategories } from "../service-categories/api";
import type { Service } from "./types";
import type { ServiceCategory } from "../service-categories/types";
import { Loader2 } from "lucide-react";

export type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "duration-asc" | "duration-desc";

// Query keys for React Query
const servicesQueryKey = ["services"] as const;
const categoriesQueryKey = ["service-categories"] as const;

export function ServicesMarketplace() {
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortOption, setSortOption] = useState<SortOption>("name-asc");

	// Fetch services
	const {
		data: services = [],
		isLoading: servicesLoading,
		error: servicesError,
	} = useQuery({
		queryKey: servicesQueryKey,
		queryFn: () => fetchServices(),
		staleTime: 30 * 1000, // 30 seconds
	});

	// Fetch categories
	const {
		data: categories = [],
		isLoading: categoriesLoading,
		error: categoriesError,
	} = useQuery({
		queryKey: categoriesQueryKey,
		queryFn: () => fetchServiceCategories(),
		staleTime: 60 * 1000, // 1 minute - categories change less frequently
	});

	const isLoading = servicesLoading || categoriesLoading;
	const error = servicesError || categoriesError;

	// Filter and sort services
	const filteredAndSortedServices = useMemo(() => {
		let filtered = [...services];

		// Filter by category
		if (selectedCategoryId) {
			filtered = filtered.filter(service => service.categoryId === selectedCategoryId);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(service =>
				service.name.toLowerCase().includes(query) ||
				service.description.toLowerCase().includes(query) ||
				service.provider?.name.toLowerCase().includes(query) ||
				service.category?.name.toLowerCase().includes(query)
			);
		}

		// Sort services
		filtered.sort((a, b) => {
			switch (sortOption) {
				case "name-asc":
					return a.name.localeCompare(b.name);
				case "name-desc":
					return b.name.localeCompare(a.name);
				case "price-asc":
					return a.price - b.price;
				case "price-desc":
					return b.price - a.price;
				case "duration-asc":
					return a.duration - b.duration;
				case "duration-desc":
					return b.duration - a.duration;
				default:
					return 0;
			}
		});

		return filtered;
	}, [services, selectedCategoryId, searchQuery, sortOption]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<p className="text-red-600 mb-4">
					{error instanceof Error ? error.message : "Failed to load services"}
				</p>
				<button
					onClick={() => window.location.reload()}
					className="text-primary hover:underline"
				>
					Try again
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Enhanced Search and Filter Section */}
			<div className="bg-card border rounded-lg p-6 shadow-sm">
				{/* Search and Sort Controls */}
				<div className="flex flex-col lg:flex-row gap-4 mb-6">
					<div className="flex-1">
						<ServiceSearch
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Search services, providers, or categories..."
						/>
					</div>
					<div className="lg:w-64">
						<ServiceSort
							value={sortOption}
							onChange={setSortOption}
						/>
					</div>
				</div>

				{/* Category Filter */}
				<CategoryFilter
					categories={categories}
					selectedCategoryId={selectedCategoryId}
					onCategorySelect={setSelectedCategoryId}
					serviceCount={services.length}
				/>
			</div>

			{/* Enhanced Results Summary */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					{filteredAndSortedServices.length === 0 ? (
						<span>No services found matching your criteria</span>
					) : (
						<span>
							Showing <span className="font-medium text-foreground">{filteredAndSortedServices.length}</span> of <span className="font-medium text-foreground">{services.length}</span> services
							{selectedCategoryId && " in selected category"}
						</span>
					)}
				</div>
				{(searchQuery || selectedCategoryId) && (
					<button
						onClick={() => {
							setSearchQuery("");
							setSelectedCategoryId(null);
						}}
						className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
					>
						Clear all filters
					</button>
				)}
			</div>

			{/* Enhanced Service List */}
			{filteredAndSortedServices.length > 0 ? (
				<ServiceList services={filteredAndSortedServices} />
			) : (
				<div className="flex flex-col items-center justify-center py-16 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
					<div className="text-center max-w-md">
						<div className="mb-4">
							<div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
								<Loader2 className="h-8 w-8 text-muted-foreground" />
							</div>
						</div>
						<h3 className="text-lg font-semibold text-foreground mb-2">No services found</h3>
						<p className="text-muted-foreground mb-4">
							Try adjusting your search terms or category filters to find what you're looking for.
						</p>
						<button
							onClick={() => {
								setSearchQuery("");
								setSelectedCategoryId(null);
							}}
							className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
						>
							Clear all filters
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
