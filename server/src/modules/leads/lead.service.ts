import { and, asc, count, desc, type SQL } from "drizzle-orm";
import { db } from "../../db/index.js";
import { leads, type LeadStatus } from "../../db/schema.js";
import { ApiError } from "../../utils/ApiError.js";
import type { CreateLeadInput, ListLeadsQuery, UpdateLeadInput } from "./lead.schema.js";

/**
 * Service layer = business logic + DB access. No req/res here, so it's easy to unit test.
 */

// ✅ WORKING
export async function createLead(input: CreateLeadInput) {
  const [lead] = await db.insert(leads).values(input).returning();
  return lead;
}

// ✅ WORKING (pagination + sort). Search/filter is your step 1.
export async function listLeads(q: ListLeadsQuery) {
  const conditions: SQL[] = [];

  // TODO(step 1): push conditions based on the query, e.g.
  //   - q.search → or(ilike(leads.name, `%${q.search}%`), ilike(leads.phone, `%${q.search}%`))
  //   - q.source (array, e.g. ["GOOGLE","FACEBOOK"]) → inArray(leads.source, q.source)
  //   - q.status (array) → inArray(leads.status, q.status)
  // (import or / ilike / inArray from "drizzle-orm"). The client already sends these params,
  // so the list page will "just work" once this is done.

  const where = conditions.length ? and(...conditions) : undefined;
  const sortCol = q.sortBy === "budget" ? leads.budget : leads.createdAt;
  const direction = q.order === "asc" ? asc : desc;

  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(where)
      .orderBy(direction(sortCol), desc(leads.id)) // tie-breaker → stable pagination
      .limit(q.limit)
      .offset((q.page - 1) * q.limit),
    db.select({ total: count() }).from(leads).where(where),
  ]);

  return {
    items,
    meta: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) },
  };
}

// 🚧 STEP 2
export async function getLeadById(id: string) {
  // TODO(step 2):
  //   const lead = await db.query.leads.findFirst({
  //     where: eq(leads.id, id),
  //     with: { notes: { orderBy: (n, { desc }) => [desc(n.createdAt)] } },
  //   });
  //   if (!lead) throw ApiError.notFound("Lead not found");
  void id;
  throw ApiError.notImplemented("Get lead by id");
}

// 🚧 STEP 3
export async function updateLeadStatus(id: string, status: LeadStatus) {
  // TODO(step 3): db.update(leads).set({ status }).where(eq(leads.id, id)).returning()
  //   - empty result array → throw ApiError.notFound
  void [id, status];
  throw ApiError.notImplemented("Update lead status");
}

// 🚧 STEP 3
export async function addNote(leadId: string, content: string) {
  // TODO(step 3): db.insert(notes).values({ leadId, content }).returning()
  //   - unknown leadId → Postgres FK violation (23503), already mapped to 404 in errorHandler
  void [leadId, content];
  throw ApiError.notImplemented("Add note");
}

// 🚧 STEP 4 (CRUD completeness — not in the brief's UI, but "CRUD operations" is a tech requirement)
export async function updateLead(id: string, input: UpdateLeadInput) {
  void [id, input];
  throw ApiError.notImplemented("Update lead");
}

export async function deleteLead(id: string) {
  void id;
  throw ApiError.notImplemented("Delete lead");
}
