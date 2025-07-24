"use client";

import { useState } from "react";
import type { Service } from "../../../../../../modules/services/types";
import type { AvailabilityTimeSlot } from "../../../../../../modules/availability/types";
import { BookingDialog } from "../../../../../../modules/bookings/components/booking-dialog";
import { AvailabilityCalendar } from "../../../../../../modules/availability/components/availability-calendar";
import { ReviewSection } from "../../../../../../modules/services/components/review-section";
import { Button } from "../../../../../../modules/ui/components/button";
import { ContactProviderButton } from "./contact-provider-button";

interface ServiceInteractionsProps {
	service: Service;
	session: any;
	userBookings: any[];
}

export function ServiceInteractions({ 
	service, 
	session, 
	userBookings 
}: ServiceInteractionsProps) {
	const [selectedSlot, setSelectedSlot] = useState<AvailabilityTimeSlot | null>(null);

	const handleSlotSelect = (slot: AvailabilityTimeSlot) => {
		setSelectedSlot(slot);
	};

	return (
		<>
			{/* Availability Calendar with booking integration */}
			<div className="lg:col-span-2">
				<AvailabilityCalendar
					providerId={service.providerId}
					serviceId={service.id}
					readonly={false}
					onSlotSelect={handleSlotSelect}
				/>
				{selectedSlot && (
					<div className="mt-4 p-4 bg-primary/10 rounded-lg border">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-primary">Selected Time Slot</p>
								<p className="text-sm text-muted-foreground">
									{selectedSlot.displayTime} on {new Date(selectedSlot.date).toLocaleDateString()}
								</p>
							</div>
							<BookingDialog 
								service={service} 
								preSelectedSlot={selectedSlot}
							>
								<Button>Book Now</Button>
							</BookingDialog>
						</div>
					</div>
				)}
			</div>

			{/* Reviews Section */}
			<div className="lg:col-span-2">
				<ReviewSection
					serviceId={service.id}
					currentUserId={session?.user?.id}
					userRole={session?.user?.userType}
					userBookings={userBookings}
				/>
			</div>
		</>
	);
}
