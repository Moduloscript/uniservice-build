import type { ServiceCategory } from "./types";
import { CategoryCard } from "./category-card";

interface CategoryListProps {
	categories: ServiceCategory[];
	onCategoryClick?: (category: ServiceCategory) => void;
	className?: string;
}

export function CategoryList({
	categories,
	onCategoryClick,
	className,
}: CategoryListProps) {
	return (
		<div
			className={
				className ??
				"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
			}
		>
			{categories.map((category) => (
				<CategoryCard
					key={category.id}
					category={category}
					onClick={() => onCategoryClick?.(category)}
				/>
			))}
		</div>
	);
}
