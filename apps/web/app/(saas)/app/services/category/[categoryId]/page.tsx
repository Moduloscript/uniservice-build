import { ServiceList } from "../../../../../modules/services/service-list";
import { fetchServices } from "../../../../../modules/services/api";
import { fetchServiceCategories } from "../../../../../modules/service-categories/api";
import type { Service } from "../../../../../modules/services/types";
import type { ServiceCategory } from "../../../../../modules/service-categories/types";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface CategoryPageProps {
	params: { categoryId: string };
}

async function ServicesSection({ categoryId }: { categoryId: string }) {
	let services: Service[] = [];
	let error: string | null = null;
	try {
		services = await fetchServices(categoryId);
	} catch (e) {
		error = (e as Error).message;
	}
	if (error) {
		return <div className="text-red-500">{error}</div>;
	}
	if (!services.length) {
		return (
			<div className="text-gray-500">
				No services found in this category.
			</div>
		);
	}
	return <ServiceList services={services} />;
}

async function getCategory(
	categoryId: string,
): Promise<ServiceCategory | null> {
	try {
		const categories = await fetchServiceCategories();
		return categories.find((cat) => cat.id === categoryId) ?? null;
	} catch {
		return null;
	}
}

export default async function CategoryServicesPage({
	params,
}: CategoryPageProps) {
	const category = await getCategory(params.categoryId);
	if (!category) {
		return notFound();
	}
	return (
		<main className="max-w-5xl mx-auto py-8 px-4">
			<h1 className="text-2xl font-bold mb-6">{category.name}</h1>
			<Suspense fallback={<div>Loading services...</div>}>
				<ServicesSection categoryId={params.categoryId} />
			</Suspense>
		</main>
	);
}
