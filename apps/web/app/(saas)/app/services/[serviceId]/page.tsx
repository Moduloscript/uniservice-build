import { fetchServiceByIdServer } from "../../../../../modules/services/api";
import type { Service } from "../../../../../modules/services/types";
import { BookingDialog } from "../../../../../modules/bookings/components/booking-dialog";
import { notFound } from "next/navigation";

interface ServiceDetailPageProps {
	params: { serviceId: string };
}

export default async function ServiceDetailPage({
	params,
}: ServiceDetailPageProps) {
	// Await params for Next.js 15 compatibility
	const resolvedParams = await params;
	
	let service: Service | null = null;
	let error: string | null = null;
	
	// Validate serviceId format
	if (!resolvedParams.serviceId || resolvedParams.serviceId.trim() === '') {
		return notFound();
	}
	
	try {
		service = await fetchServiceByIdServer(resolvedParams.serviceId);
	} catch (e) {
		error = (e as Error).message;
		console.error('Error fetching service:', {
			serviceId: resolvedParams.serviceId,
			error: e,
		});
	}
	
	if (error || !service) {
		return notFound();
	}

	return (
		<main className="max-w-2xl mx-auto py-8 px-4">
			<h1 className="text-2xl font-bold mb-4">{service.name}</h1>
			<div className="mb-2 text-gray-500">{service.category?.name}</div>
			<div className="mb-4 text-primary font-semibold text-lg">
				₦{service.price.toLocaleString()}
			</div>
			<div className="mb-4 text-gray-700">{service.description}</div>
			<div className="mb-2 text-xs text-gray-400">
				Duration: {service.duration} min
			</div>
			{service.provider && (
				<div className="mb-6 text-sm text-gray-500">
					Provider: {service.provider.name}
				</div>
			)}
			
			{/* Booking Button */}
			<div className="mt-6">
				<BookingDialog service={service} />
			</div>
		</main>
	);
}
