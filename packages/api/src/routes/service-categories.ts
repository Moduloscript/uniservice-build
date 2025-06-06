import { Hono } from "hono";
import { db } from "@repo/database";
import { authMiddleware } from "../middleware/auth";

export const serviceCategoriesRouter = new Hono()
	.use(authMiddleware)
	.get("/", async (c) => {
		const categories = await db.serviceCategory.findMany({
			orderBy: { name: "asc" },
		});
		return c.json({ categories });
	});
