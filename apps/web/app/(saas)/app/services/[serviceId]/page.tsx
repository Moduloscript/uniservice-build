import { fetchServiceByIdServer } from "../../../../../modules/services/api";
import type { Service } from "../../../../../modules/services/types";
import { BookingDialog } from "../../../../../modules/bookings/components/booking-dialog";
import { ProviderInfo } from "../../../../../modules/services/components/provider-info";
import { Badge } from "../../../../../modules/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../modules/ui/components/card";
import { notFound } from "next/navigation";
import { Clock, DollarSign, Tag } from "lucide-react";

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
		<main className="max-w-6xl mx-auto py-8 px-4">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content - Left Column */}
				<div className="lg:col-span-2 space-y-6">
					{/* Service Header */}
					<Card>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div>
									<h1 className="text-3xl font-bold text-foreground mb-2">
										{service.name}
									</h1>
									{service.category && (
										<Badge variant="secondary" className="mb-3">
											<Tag className="h-3 w-3 mr-1" />
											{service.category.name}
										</Badge>
									)}
								</div>
								<div className="text-right">
									<div className="text-3xl font-bold text-primary mb-1">
										₦{service.price.toLocaleString()}
									</div>
									<div className="flex items-center text-sm text-muted-foreground">
										<Clock className="h-4 w-4 mr-1" />
										{service.duration} min
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="prose prose-sm max-w-none">
								<p className="text-foreground leading-relaxed">
									{service.description}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Service Details */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<DollarSign className="h-5 w-5 text-primary" />
								Service Details
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium text-muted-foreground">Price:</span>
									<p className="text-lg font-semibold text-primary">
										₦{service.price.toLocaleString()}
									</p>
								</div>
								<div>
									<span className="font-medium text-muted-foreground">Duration:</span>
									<p className="text-lg font-semibold text-foreground">
										{service.duration} minutes
									</p>
								</div>
								{service.category && (
									<div className="col-span-2">
										<span className="font-medium text-muted-foreground">Category:</span>
										<p className="text-foreground">{service.category.name}</p>
										{service.category.description && (
											<p className="text-sm text-muted-foreground mt-1">
												{service.category.description}
											</p>
										)}
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar - Right Column */}
				<div className="space-y-6">
					{/* Provider Information */}
					{service.provider && (
						<ProviderInfo provider={service.provider} />
					)}

					{/* Booking Section */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Book This Service</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="text-sm text-muted-foreground">
									Ready to book this service? Choose your preferred date and time.
								</div>
								<BookingDialog service={service} />
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</main>
	);
}
