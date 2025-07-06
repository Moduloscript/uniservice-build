"use client";

import { Button } from "@ui/components/button";
import { cn } from "@ui/lib";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	isLoading?: boolean;
	onPageChange: (page: number) => void;
}

export function VerificationDocsPagination({
	currentPage,
	totalPages,
	totalItems,
	isLoading,
	onPageChange,
}: PaginationProps) {
	const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
	const canGoPrevious = currentPage > 1;
	const canGoNext = currentPage < totalPages;

	// Show 5 page numbers around current page
	const visiblePages = pageNumbers.filter(
		(pageNum) => Math.abs(pageNum - currentPage) <= 2,
	);

	return (
		<div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row sm:gap-6">
			<p className="text-sm text-muted-foreground">
				Showing {Math.min((currentPage - 1) * 10 + 1, totalItems)} to{" "}
				{Math.min(currentPage * 10, totalItems)} of {totalItems} items
			</p>

			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="icon"
					disabled={!canGoPrevious || isLoading}
					onClick={() => onPageChange(1)}
					className="hidden h-8 w-8 sm:flex"
					aria-label="First page"
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>

				<Button
					variant="outline"
					size="icon"
					disabled={!canGoPrevious || isLoading}
					onClick={() => onPageChange(currentPage - 1)}
					className="h-8 w-8"
					aria-label="Previous page"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				<div className="hidden gap-1 sm:flex">
					{visiblePages.map((pageNum) => (
						<Button
							key={pageNum}
							variant={
								pageNum === currentPage ? "primary" : "outline"
							}
							size="icon"
							disabled={isLoading}
							onClick={() => onPageChange(pageNum)}
							className={cn(
								"h-8 w-8",
								pageNum === currentPage &&
									"pointer-events-none",
							)}
							aria-label={`Page ${pageNum}`}
							aria-current={
								pageNum === currentPage ? "page" : undefined
							}
						>
							{pageNum}
						</Button>
					))}
				</div>

				<span className="text-sm font-medium sm:hidden">
					Page {currentPage} of {totalPages}
				</span>

				<Button
					variant="outline"
					size="icon"
					disabled={!canGoNext || isLoading}
					onClick={() => onPageChange(currentPage + 1)}
					className="h-8 w-8"
					aria-label="Next page"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>

				<Button
					variant="outline"
					size="icon"
					disabled={!canGoNext || isLoading}
					onClick={() => onPageChange(totalPages)}
					className="hidden h-8 w-8 sm:flex"
					aria-label="Last page"
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
