import type { ServiceCategory } from "./types";
import { cn } from "@ui/lib";
import Link from "next/link";

interface CategoryCardProps {
	category: ServiceCategory;
	className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
	return (
		<Link
			href={`/app/services/category/${category.id}`}
			className={cn(
				"flex flex-col items-center justify-center rounded-lg border bg-white shadow-sm hover:shadow-md transition p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary",
				className,
			)}
			aria-label={category.name}
		>
			{/* Icon placeholder or category image can go here */}
			<span className="text-lg font-semibold text-gray-900 mb-1">
				{category.name}
			</span>
			{category.description && (
				<span className="text-sm text-gray-500 text-center">
					{category.description}
				</span>
			)}
		</Link>
	);
}
