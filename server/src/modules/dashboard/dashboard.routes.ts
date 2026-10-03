import { Router } from "express";
import { asc, count, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { leads, leadSourceEnum, leadStatusEnum } from "../../db/schema.js";

export const dashboardRouter = Router();

// Only the columns the dashboard cards need
const cardColumns = {
  id: leads.id,
  name: leads.name,
  phone: leads.phone,
  budget: leads.budget,
  location: leads.location,
  propertyType: leads.propertyType,
  source: leads.source,
  status: leads.status,
  createdAt: leads.createdAt,
};

/**
 * GET /api/dashboard/stats
 * {
 *   data: {
 *     totalLeads, conversionRate (0..1),
 *     pipelineValue,                   // sum of budgets of leads that are not CLOSED
 *     bySource: [{ source, count }],   // every source, 0 if none
 *     byStatus: [{ status, count }],   // every status, 0 if none
 *     topLead,                         // open lead with the highest budget (or null)
 *     needsAttention: { count, leads } // NEW leads, oldest first (waiting longest)
 *     recentLeads                      // 2 newest leads
 *   }
 * }
 */
dashboardRouter.get("/stats", async (_req, res) => {
  // Let Postgres do the counting/summing — all queries run in parallel.
  const [[{ total }], sourceRows, statusRows, [{ pipelineValue }], [topLead], waiting, recentLeads] =
    await Promise.all([
      db.select({ total: count() }).from(leads),
      db.select({ source: leads.source, count: count() }).from(leads).groupBy(leads.source),
      db.select({ status: leads.status, count: count() }).from(leads).groupBy(leads.status),
      db
        .select({ pipelineValue: sql<number>`coalesce(sum(${leads.budget}), 0)`.mapWith(Number) })
        .from(leads)
        .where(ne(leads.status, "CLOSED")),
      db.select(cardColumns).from(leads).where(ne(leads.status, "CLOSED")).orderBy(desc(leads.budget)).limit(1),
      db.select(cardColumns).from(leads).where(eq(leads.status, "NEW")).orderBy(asc(leads.createdAt)).limit(3),
      db.select(cardColumns).from(leads).orderBy(desc(leads.createdAt)).limit(2),
    ]);

  // GROUP BY only returns groups that exist → fill missing ones with 0, in enum order.
  const bySource = leadSourceEnum.enumValues.map((source) => ({
    source,
    count: sourceRows.find((r) => r.source === source)?.count ?? 0,
  }));
  const byStatus = leadStatusEnum.enumValues.map((status) => ({
    status,
    count: statusRows.find((r) => r.status === status)?.count ?? 0,
  }));

  const closed = byStatus.find((s) => s.status === "CLOSED")?.count ?? 0;
  const newCount = byStatus.find((s) => s.status === "NEW")?.count ?? 0;

  res.json({
    data: {
      totalLeads: total,
      conversionRate: total === 0 ? 0 : closed / total, // guard divide-by-zero
      pipelineValue,
      bySource,
      byStatus,
      topLead: topLead ?? null,
      needsAttention: { count: newCount, leads: waiting },
      recentLeads,
    },
  });
});