import { CategoryList } from "../../../modules/service-categories/category-list";
import { fetchServiceCategories } from "../../../modules/service-categories/api";
import type { ServiceCategory } from "../../../modules/service-categories/types";
import { Suspense } from "react";

async function CategoriesSection() {
	let categories: ServiceCategory[] = [];
	let error: string | null = null;
	try {
		categories = await fetchServiceCategories();
	} catch (e) {
		error = (e as Error).message;
	}
	if (error) {
		return <div className="text-red-500">{error}</div>;
	}
	if (!categories.length) {
		return (
			<div className="text-gray-500">No service categories found.</div>
		);
	}
	return <CategoryList categories={categories} />;
}

export default function ServicesPage() {
	return (
		<main className="max-w-5xl mx-auto py-8 px-4">
			<h1 className="text-2xl font-bold mb-6">
				Browse Service Categories
			</h1>
			<Suspense fallback={<div>Loading categories...</div>}>
				<CategoriesSection />
			</Suspense>
		</main>
	);
}
