import { Hono } from "hono";
import { db } from "@repo/database";

export const serviceCategoriesRouter = new Hono().get(
	"/service-categories",
	async (c) => {
		const categories = await db.serviceCategory.findMany({
			orderBy: { name: "asc" },
		});
		return c.json({ categories });
	},
);
