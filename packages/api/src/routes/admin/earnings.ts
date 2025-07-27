import { Hono } from "hono";
import { adminMiddleware } from "../../middleware/admin";
import { earningsBackfillHandler } from "./earnings-backfill";

export const earningsAdminRouter = new Hono()
  .post("/backfill", adminMiddleware, earningsBackfillHandler);
