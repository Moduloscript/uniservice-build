import { db } from "@repo/database";
import { logger } from "@repo/logs";
import { nanoid } from "nanoid";

async function main() {
	logger.info("Seeding provider availability data...");

	try {
		// Get existing providers and services
		const providers = await db.user.findMany({
			where: { userType: "PROVIDER" },
			include: { services: true },
		});

		if (providers.length === 0) {
			logger.warn(
				"No providers found. Please seed users and services first.",
			);
			return;
		}

		// Create availability for next 14 days
		const startDate = new Date();
		const endDate = new Date();
		endDate.setDate(startDate.getDate() + 14);

		let totalSlotsCreated = 0;

		for (const provider of providers) {
			logger.info(`Creating availability for provider: ${provider.name}`);

			for (const service of provider.services) {
				// Create availability slots for each service
				const availabilitySlots = [];

				// Generate time slots for next 14 days
				for (
					let date = new Date(startDate);
					date <= endDate;
					date.setDate(date.getDate() + 1)
				) {
					// Skip weekends for this example
					const dayOfWeek = date.getDay();
					if (dayOfWeek === 0 || dayOfWeek === 6) continue;

					// Create morning slots (9 AM - 12 PM)
					const morningSlots = [
						{ start: "09:00:00", end: "10:00:00" },
						{ start: "10:00:00", end: "11:00:00" },
						{ start: "11:00:00", end: "12:00:00" },
					];

					// Create afternoon slots (2 PM - 5 PM)
					const afternoonSlots = [
						{ start: "14:00:00", end: "15:00:00" },
						{ start: "15:00:00", end: "16:00:00" },
						{ start: "16:00:00", end: "17:00:00" },
					];

					const allSlots = [...morningSlots, ...afternoonSlots];

					for (const slot of allSlots) {
						// Randomly skip some slots to simulate real availability
						if (Math.random() < 0.3) continue;

						const id = nanoid();
						const currentDate = new Date(date);

						availabilitySlots.push({
							id,
							providerId: provider.id,
							serviceId: service.id,
							date: currentDate,
							startTime: new Date(`1970-01-01T${slot.start}`),
							endTime: new Date(`1970-01-01T${slot.end}`),
							isAvailable: true,
							isBooked: Math.random() < 0.1, // 10% chance of being booked
							maxBookings: Math.floor(Math.random() * 2) + 1, // 1-2 max bookings
							currentBookings: 0,
							notes:
								Math.random() < 0.1
									? "Special session available"
									: null,
							createdAt: new Date(),
							updatedAt: new Date(),
						});
					}
				}

				// Insert availability slots in batches
				if (availabilitySlots.length > 0) {
					await db.providerAvailability.createMany({
						data: availabilitySlots,
						skipDuplicates: true,
					});

					totalSlotsCreated += availabilitySlots.length;
					logger.success(
						`  ✅ Created ${availabilitySlots.length} availability slots for service: ${service.name}`,
					);
				}
			}
		}

		logger.success(
			`✅ Provider availability seeding completed! Created ${totalSlotsCreated} total availability slots.`,
		);
	} catch (error) {
		logger.error("❌ Error seeding provider availability:", error);
		throw error;
	}
}

main().catch((err) => {
	logger.error("Error seeding provider availability:", err);
	process.exit(1);
});
