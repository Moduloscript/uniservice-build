import { db } from "@repo/database";
import { logger } from "@repo/logs";
import { nanoid } from "nanoid";

async function main() {
	logger.info("Seeding service categories...");

	const categories = [
		{
			name: "Academic Services",
			description: "Tutoring, project help, and more",
		},
		{
			name: "Personal Services",
			description: "Laundry, cleaning, errands, etc.",
		},
		{
			name: "Food & Delivery",
			description: "Meals, snacks, groceries, delivery",
		},
		{
			name: "Beauty & Wellness",
			description: "Hair, makeup, spa, fitness",
		},
		{
			name: "Tech Support",
			description: "Device repair, software help, IT",
		},
		{
			name: "Event Services",
			description: "Event planning, decoration, rentals",
		},
	];

	const categoryIdMap: Record<string, string> = {};

	for (const category of categories) {
		const id = nanoid();
		categoryIdMap[category.name] = id;
		await seedCategory(id, category.name, category.description);
	}

	logger.success("Service categories seeding complete.");
}

async function seedCategory(id: string, name: string, description: string) {
	const existing = await db.serviceCategory.findFirst({
		where: {
			OR: [{ id }, { name }],
		},
	});

	if (!existing) {
		await db.serviceCategory.create({
			data: {
				id,
				name,
				description,
			},
		});
		logger.success(`Seeded category: ${name}`);
	} else {
		logger.info(`Category already exists: ${name}`);
	}
}

main().catch((err) => {
	logger.error("Error seeding service categories:", err);
	process.exit(1);
});
