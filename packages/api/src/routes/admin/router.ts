import { Hono } from "hono";
import { organizationRouter } from "./organizations";
import { userRouter } from "./users";
import { verificationDocsAdminRouter } from "./verification-docs";
import { earningsAdminRouter } from "./earnings";

export const adminRouter = new Hono()
	.basePath("/admin")
	.route("/verification-docs", verificationDocsAdminRouter)
	.route("/earnings", earningsAdminRouter)
	.route("/", organizationRouter)
	.route("/", userRouter);
