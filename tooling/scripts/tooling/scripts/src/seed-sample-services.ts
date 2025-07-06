import { db } from "@repo/database";
import { logger } from "@repo/logs";
import { nanoid } from "nanoid";

async function main() {
	logger.info("Seeding sample services across all categories...");

	// First, get all available categories
	const categories = await db.serviceCategory.findMany();
	if (categories.length === 0) {
		logger.error("No service categories found. Please run seed:categories first.");
		return;
	}

	// Get users who can be service providers (non-admin users)
	const providers = await db.user.findMany({
		where: {
			role: { not: "admin" }
		}
	});

	if (providers.length === 0) {
		logger.error("No non-admin users found. Please create some users first.");
		return;
	}

	// Sample services data organized by category
	const sampleServices = {
		"academic-services": [
			{
				name: "Mathematics Tutoring",
				description: "Expert mathematics tutoring for 100-400 level courses. Specializing in Calculus, Linear Algebra, and Statistics.",
				price: 2000,
				duration: 60
			},
			{
				name: "Project Writing Assistance",
				description: "Professional help with academic project writing, research, and formatting. All departments welcome.",
				price: 5000,
				duration: 120
			},
			{
				name: "English Language Coaching",
				description: "Improve your English speaking, writing, and comprehension skills. Perfect for international students.",
				price: 1500,
				duration: 45
			}
		],
		"personal-services": [
			{
				name: "Laundry Service",
				description: "Professional laundry service with pickup and delivery. Washing, ironing, and dry cleaning available.",
				price: 1000,
				duration: 1440 // 24 hours
			},
			{
				name: "Room Cleaning",
				description: "Thorough room cleaning service including dusting, mopping, and organizing. Hostels and private apartments.",
				price: 1500,
				duration: 90
			},
			{
				name: "Shopping Errands",
				description: "Personal shopping assistant for groceries, textbooks, and other essentials. Save time while studying!",
				price: 500,
				duration: 60
			}
		],
		"food-delivery": [
			{
				name: "Campus Food Delivery",
				description: "Fast delivery of meals from popular campus restaurants. Hot and fresh food delivered to your location.",
				price: 300,
				duration: 30
			},
			{
				name: "Home-cooked Meals",
				description: "Delicious home-cooked Nigerian meals prepared with fresh ingredients. Weekly meal plans available.",
				price: 800,
				duration: 45
			},
			{
				name: "Late Night Snacks",
				description: "24/7 snack delivery service for those late-night study sessions. Sandwiches, drinks, and more.",
				price: 400,
				duration: 20
			}
		],
		"beauty-wellness": [
			{
				name: "Hair Styling & Braiding",
				description: "Professional hair styling, braiding, and treatments. All hair types welcome. Mobile service available.",
				price: 3000,
				duration: 180
			},
			{
				name: "Manicure & Pedicure",
				description: "Complete nail care service including manicure, pedicure, and nail art. Hygienic tools and quality products.",
				price: 2000,
				duration: 90
			},
			{
				name: "Fitness Training",
				description: "Personal fitness training sessions. Weight loss, muscle building, and general fitness programs available.",
				price: 2500,
				duration: 60
			}
		],
		"tech-support": [
			{
				name: "Laptop Repair",
				description: "Expert laptop repair service. Hardware issues, software problems, virus removal, and performance optimization.",
				price: 5000,
				duration: 240
			},
			{
				name: "Phone Screen Replacement",
				description: "Professional phone screen replacement service. All major brands supported with genuine parts.",
				price: 8000,
				duration: 60
			},
			{
				name: "Computer Tutoring",
				description: "Learn computer skills including MS Office, coding basics, and internet navigation. Patient and friendly instruction.",
				price: 1800,
				duration: 90
			}
		],
		"event-services": [
			{
				name: "Birthday Party Planning",
				description: "Complete birthday party planning and coordination. Decorations, catering coordination, and entertainment.",
				price: 15000,
				duration: 480
			},
			{
				name: "Event Photography",
				description: "Professional event photography for parties, graduations, and special occasions. High-quality photos delivered digitally.",
				price: 10000,
				duration: 240
			},
			{
				name: "Sound System Rental",
				description: "Professional sound system rental for events. Microphones, speakers, and technical support included.",
				price: 5000,
				duration: 360
			}
		]
	};

	let totalCreated = 0;
	let currentProviderIndex = 0;

	// Create services for each category
	for (const category of categories) {
		const servicesForCategory = sampleServices[category.id as keyof typeof sampleServices];
		
		if (!servicesForCategory) {
			logger.warn(`No sample services defined for category: ${category.name}`);
			continue;
		}

		logger.info(`Creating services for category: ${category.name}`);

		for (const serviceData of servicesForCategory) {
			// Rotate through available providers
			const provider = providers[currentProviderIndex % providers.length];
			currentProviderIndex++;

			try {
				await db.service.create({
					data: {
						id: nanoid(),
						name: serviceData.name,
						description: serviceData.description,
						price: serviceData.price,
						duration: serviceData.duration,
						categoryId: category.id,
						providerId: provider.id,
						isActive: true,
						createdAt: new Date(),
						updatedAt: new Date()
					}
				});

				totalCreated++;
				logger.success(`✓ Created: ${serviceData.name} (Provider: ${provider.name})`);
			} catch (error) {
				logger.error(`Failed to create service: ${serviceData.name}`, error);
			}
		}
	}

	logger.success(`🎉 Sample services seeding complete! Created ${totalCreated} services across ${categories.length} categories.`);
	
	// Display summary
	const summary = await db.service.groupBy({
		by: ['categoryId'],
		_count: {
			id: true
		}
	});

	logger.info("\nServices per category:");
	for (const cat of categories) {
		const count = summary.find(s => s.categoryId === cat.id)?._count.id || 0;
		logger.info(`  ${cat.name}: ${count} services`);
	}
}

main().catch((err) => {
	logger.error("Error seeding sample services:", err);
	process.exit(1);
});
