import type { ServiceCategory } from "../service-categories/types";
import { cn } from "@ui/lib";
import { Check } from "lucide-react";

interface CategoryFilterProps {
	categories: ServiceCategory[];
	selectedCategoryId: string | null;
	onCategorySelect: (categoryId: string | null) => void;
	serviceCount?: number;
}

export function CategoryFilter({
	categories,
	selectedCategoryId,
	onCategorySelect,
	serviceCount,
}: CategoryFilterProps) {
	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold text-foreground">Filter by Category</h3>
			<div className="flex flex-wrap gap-3">
				{/* All Services button */}
				<button
					onClick={() => onCategorySelect(null)}
					className={cn(
						"inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
						"border hover:shadow-sm",
						selectedCategoryId === null
							? "bg-primary text-primary-foreground border-primary shadow-sm"
							: "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground hover:bg-muted/50"
					)}
				>
					{selectedCategoryId === null && <Check className="h-3.5 w-3.5" />}
					All Services
					{serviceCount !== undefined && (
						<span className="text-xs bg-background/20 px-1.5 py-0.5 rounded-full">({serviceCount})</span>
					)}
				</button>

				{/* Category buttons */}
				{categories.map((category) => (
					<button
						key={category.id}
						onClick={() => onCategorySelect(category.id)}
						className={cn(
							"inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
							"border hover:shadow-sm",
							selectedCategoryId === category.id
								? "bg-primary text-primary-foreground border-primary shadow-sm"
								: "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground hover:bg-muted/50"
						)}
					>
						{selectedCategoryId === category.id && <Check className="h-3.5 w-3.5" />}
						{category.name}
					</button>
				))}
			</div>
		</div>
	);
}
