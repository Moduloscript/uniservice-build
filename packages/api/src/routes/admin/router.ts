import { Hono } from "hono";
import { organizationRouter } from "./organizations";
import { userRouter } from "./users";
import { verificationDocsAdminRouter } from "./verification-docs";

export const adminRouter = new Hono()
	.basePath("/admin")
	.route("/verification-docs", verificationDocsAdminRouter)
	.route("/", organizationRouter)
	.route("/", userRouter);
