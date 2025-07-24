import { config } from "@repo/config";
import { getSignedUploadUrl } from "@repo/storage";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

export const uploadsRouter = new Hono().basePath("/uploads").post(
	"/signed-upload-url",
	authMiddleware,
	validator(
		"query",
		z.object({
			bucket: z.string().min(1),
			path: z.string().min(1),
		}),
	),
	describeRoute({
		tags: ["Uploads"],
		summary: "Get a signed upload url",
		description: "Get a signed upload url for a given bucket and path",
		responses: {
			200: {
				description: "Returns a signed upload url",
				content: {
					"application/json": {
						schema: resolver(z.object({ signedUrl: z.string() })),
					},
				},
			},
			403: {
				description: "Not allowed",
			},
		},
	}),
	async (c) => {
		const { bucket, path } = c.req.valid("query");
		const user = c.get("user");

		// Get allowed buckets from config
		const allowedBuckets = Object.values(config.storage.bucketNames);
		if (!allowedBuckets.includes(bucket)) {
			throw new HTTPException(403, { message: "Invalid bucket" });
		}

		// Check bucket-specific permissions
		if (
			bucket === config.storage.bucketNames.verificationDocs &&
			!path.startsWith(`${user?.id || ""}-`)
		) {
			throw new HTTPException(403, {
				message: "Invalid file path for verification docs",
			});
		}
		if (
			bucket === config.storage.bucketNames.studentIdCards &&
			!path.startsWith(`${user?.id || ""}-`)
		) {
			throw new HTTPException(403, {
				message: "Invalid file path for student ID cards",
			});
		}
		const ext = path.split(".").pop()?.toLowerCase();
		const allowedExts = ["jpg", "jpeg", "png", "pdf"];
		if (!ext || !allowedExts.includes(ext)) {
			throw new HTTPException(400, {
				message: "Only JPG, PNG, and PDF files are allowed",
			});
		}
		const signedUrl = await getSignedUploadUrl(path, { bucket });
		return c.json({ signedUrl });
	},
);
