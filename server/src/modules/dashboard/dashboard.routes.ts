import { Router } from "express";
import { ApiError } from "../../utils/ApiError.js";
// import { count, eq } from "drizzle-orm";
// import { db } from "../../db/index.js";
// import { leads } from "../../db/schema.js";

export const dashboardRouter = Router();

/**
 * 🚧 STEP 5 — GET /api/dashboard/stats
 *
 * Target response:
 * {
 *   data: {
 *     totalLeads: number,
 *     bySource:  { source: LeadSource; count: number }[],
 *     byStatus:  { status: LeadStatus; count: number }[],
 *     conversionRate: number   // CLOSED / total, 0..1 (guard divide-by-zero)
 *   }
 * }
 *
 * Hint: db.select({ source: leads.source, count: count() }).from(leads).groupBy(leads.source)
 * (same for status) + a total count — run all three in parallel with Promise.all. Let Postgres aggregate — never pull all rows into Node.
 * Once it grows, split into dashboard.service.ts like the leads module.
 */
dashboardRouter.get("/stats", async (_req, _res) => {
  throw ApiError.notImplemented("Dashboard stats");
});
