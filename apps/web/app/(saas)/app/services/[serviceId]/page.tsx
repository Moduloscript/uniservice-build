import {
	fetchServiceByIdServer,
	fetchReviewStatsServer,
} from "../../../../../modules/services/api";
import type { Service } from "../../../../../modules/services/types";
import { BookingDialog } from "../../../../../modules/bookings/components/booking-dialog";
import { ProviderInfo } from "../../../../../modules/services/components/provider-info";
import { RelatedServices } from "../../../../../modules/services/components/related-services";
import { ServiceRatingDisplay } from "../../../../../modules/services/components/service-rating-display";
import { ServiceFeatures } from "../../../../../modules/services/components/service-features";
import { ServiceOutcomes } from "../../../../../modules/services/components/service-outcomes";
import { AvailabilityCalendar } from "../../../../../modules/availability/components/availability-calendar";
import { Badge } from "../../../../../modules/ui/components/badge";
import { Button } from "../../../../../modules/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../../../modules/ui/components/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContactProviderButton } from "./components/contact-provider-button";
import { SupportButtons } from "./components/support-buttons";
import { ReviewSection } from "../../../../../modules/services/components/review-section";
import { getSession } from "../../../../../modules/saas/auth/lib/server";
import { db } from "@repo/database";
import {
	Clock,
	DollarSign,
	Tag,
	Home,
	ChevronRight,
	Calendar,
	BookOpen,
	Target,
	HelpCircle,
} from "lucide-react";

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
	if (!resolvedParams.serviceId || resolvedParams.serviceId.trim() === "") {
		return notFound();
	}

	try {
		service = await fetchServiceByIdServer(resolvedParams.serviceId);
	} catch (e) {
		error = (e as Error).message;
		console.error("Error fetching service:", {
			serviceId: resolvedParams.serviceId,
			error: e,
		});
	}

	// Fetch review statistics for server-side rendering
	let reviewStats: {
		totalReviews: number;
		averageRating: number;
		ratingDistribution: Array<{
			rating: number;
			count: number;
			percentage: number;
		}>;
		lastReviewDate: string | null;
	} | null = null;

	if (service) {
		try {
			reviewStats = await fetchReviewStatsServer(service.id);
		} catch (error) {
			console.error("Error fetching review stats:", error);
			// Continue without review stats - component will handle the loading
		}
	}

	// Get current session for review functionality
	const session = await getSession();

	// Fetch user's bookings for this service to determine review eligibility
	let userBookings: Array<{
		id: string;
		serviceId: string;
		status: string;
		hasReview: boolean;
	}> = [];

	if (session?.user?.id && service) {
		try {
			const bookings = await db.booking.findMany({
				where: {
					studentId: session.user.id,
					serviceId: service.id,
				},
				include: {
					review: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			userBookings = bookings.map((booking) => ({
				id: booking.id,
				serviceId: booking.serviceId,
				status: booking.status,
				hasReview: booking.review !== null,
			}));
		} catch (error) {
			console.error("Error fetching user bookings:", error);
			// Continue without booking data - user just won't be able to review
		}
	}

	if (error || !service) {
		return notFound();
	}

	return (
		<main className="max-w-7xl mx-auto py-6 px-4">
			{/* Breadcrumb Navigation */}
			<nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
				<Link
					href="/app"
					className="flex items-center hover:text-foreground transition-colors"
				>
					<Home className="h-4 w-4" />
					<span className="ml-1">Home</span>
				</Link>
				<ChevronRight className="h-4 w-4" />
				<Link
					href="/app/services"
					className="hover:text-foreground transition-colors"
				>
					Services
				</Link>
				{service.category && (
					<>
						<ChevronRight className="h-4 w-4" />
						<Link
							href={`/app/services/category/${service.categoryId}`}
							className="hover:text-foreground transition-colors"
						>
							{service.category.name}
						</Link>
					</>
				)}
				<ChevronRight className="h-4 w-4" />
				<span className="text-foreground font-medium">
					{service.name}
				</span>
			</nav>

			{/* Hero Section */}
			<Card className="mb-8">
				<CardContent className="p-8">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Service Image/Icon */}
						<div className="lg:col-span-1">
							<div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
								<BookOpen className="h-24 w-24 text-primary" />
							</div>
						</div>

						{/* Service Info */}
						<div className="lg:col-span-2 space-y-4">
							<div className="space-y-2">
								<h1 className="text-4xl font-bold text-foreground">
									{service.name}
								</h1>
								<div className="flex items-center gap-4">
									{service.category && (
										<Badge
											variant="secondary"
											className="text-sm"
										>
											<Tag className="h-4 w-4 mr-1" />
											{service.category.name}
										</Badge>
									)}
									<ServiceRatingDisplay
										serviceId={service.id}
										initialStats={reviewStats || undefined}
									/>
								</div>
							</div>

							{/* Price and Duration */}
							<div className="flex items-center gap-6">
								<div className="flex items-center gap-2">
									<DollarSign className="h-5 w-5 text-primary" />
									<span className="text-3xl font-bold text-primary">
										₦{service.price.toLocaleString()}
									</span>
								</div>
								<div className="flex items-center gap-2 text-muted-foreground">
									<Clock className="h-5 w-5" />
									<span className="text-lg">
										{service.duration} min
									</span>
								</div>
								<div className="flex items-center gap-2 text-muted-foreground">
									<Calendar className="h-5 w-5" />
									<span className="text-lg">
										Available Now
									</span>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-4">
								<BookingDialog service={service}>
									<Button size="lg" className="text-lg px-8">
										🚀 Book This Service
									</Button>
								</BookingDialog>
								{service.provider?.email && (
									<ContactProviderButton
										email={service.provider.email}
									/>
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Main Content - Left Column */}
				<div className="lg:col-span-2 space-y-6">
					{/* Service Description */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BookOpen className="h-5 w-5 text-primary" />
								Service Description
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="prose prose-sm max-w-none">
								<p className="text-foreground leading-relaxed text-lg">
									{service.description}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* What's Included - Dynamic Service Features */}
					<ServiceFeatures serviceId={service.id} />

					{/* Learning Outcomes - Dynamic Service Outcomes */}
					<ServiceOutcomes serviceId={service.id} />

					{/* Reviews Section */}
					<ReviewSection
						serviceId={service.id}
						currentUserId={session?.user?.id}
						userRole={session?.user?.userType}
						userBookings={userBookings}
					/>

					{/* Dynamic Booking Calendar */}
					<AvailabilityCalendar
						providerId={service.providerId}
						serviceId={service.id}
						readonly={false}
						onSlotSelect={(slot) => {
							// Handle slot selection for booking
							console.log("Selected slot:", slot);
							// TODO: Open booking dialog with selected slot
						}}
					/>
				</div>

				{/* Sidebar - Right Column */}
				<div className="space-y-6">
					{/* Provider Information */}
					{service.provider && (
						<ProviderInfo provider={service.provider} />
					)}

					{/* Quick Stats */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<DollarSign className="h-5 w-5 text-primary" />
								Quick Stats
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Price:
								</span>
								<span className="font-semibold text-primary">
									₦{service.price.toLocaleString()}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Duration:
								</span>
								<span className="font-semibold">
									{service.duration} min
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Availability:
								</span>
								<span
									className={`font-semibold ${
										service.availabilityStatus ===
										"AVAILABLE"
											? "text-green-600"
											: service.availabilityStatus ===
													"BUSY"
												? "text-yellow-600"
												: service.availabilityStatus ===
														"LIMITED"
													? "text-orange-600"
													: "text-red-600"
									}`}
								>
									{service.availabilityStatus === "AVAILABLE"
										? "Available Now"
										: service.availabilityStatus === "BUSY"
											? "Busy"
											: service.availabilityStatus ===
													"LIMITED"
												? "Limited Availability"
												: "Currently Unavailable"}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Level:
								</span>
								<span className="font-semibold">
									{service.serviceLevel || "Not Specified"}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Max Students:
								</span>
								<span className="font-semibold">
									{service.maxStudents}
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Need Help Section */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<HelpCircle className="h-5 w-5 text-primary" />
								Need Help?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<SupportButtons />
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Footer Sections */}
			<div className="mt-12 space-y-8">
				{/* More from this Provider */}
				{service.provider && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Target className="h-5 w-5 text-primary" />
								More from {service.provider.name}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm text-muted-foreground mb-4">
								Explore other services offered by this provider
							</div>
							{service.providerId && (
								<RelatedServices
									currentService={service}
									type="provider"
									showAll
								/>
							)}
						</CardContent>
					</Card>
				)}

				{/* Similar Services */}
				{service.category && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Tag className="h-5 w-5 text-primary" />
								Similar Services in {service.category.name}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm text-muted-foreground mb-4">
								Discover more services in the same category
							</div>
							{service.categoryId && (
								<RelatedServices
									currentService={service}
									type="category"
									showAll
								/>
							)}
						</CardContent>
					</Card>
				)}
			</div>
		</main>
	);
}
