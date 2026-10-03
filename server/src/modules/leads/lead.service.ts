import { and, asc, count, desc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";import { db } from "../../db/index.js";
import { leads, notes, type LeadStatus } from "../../db/schema.js";
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
  console.log("listLeads query:", q);

  const conditions: SQL[] = [];

  if (q.status?.length) {
    conditions.push(inArray(leads.status, q.status));
  }

  if (q.source?.length) {
    conditions.push(inArray(leads.source, q.source));
  }

  if (q.search) {
    const term = `%${q.search}%`;

    const searchCondition = or(
      ilike(leads.name, term),
      ilike(leads.phone, term)
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  // ✅ Create WHERE only AFTER building all conditions
  const where = conditions.length
    ? and(...conditions)
    : undefined;

  const sortCol =
    q.sortBy === "budget"
      ? leads.budget
      : leads.createdAt;

  const direction =
    q.order === "asc"
      ? asc
      : desc;

  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(where)
      .orderBy(direction(sortCol), desc(leads.id))
      .limit(q.limit)
      .offset((q.page - 1) * q.limit),

    db
      .select({ total: count() })
      .from(leads)
      .where(where),
  ]);

  console.log("listLeads result:", { items, total });

  return {
    items,
    meta: {
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.ceil(total / q.limit),
    },
  };
}

// 🚧 STEP 2
export async function getLeadById(id: string) {
  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, id),
    with: {
      notes: { orderBy: (n, { desc }) => [desc(n.createdAt)] },
    },
  });

  if (!lead) throw ApiError.notFound("Lead not found");
  return lead;
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const [lead] = await db
    .update(leads)
    .set({ status })
    .where(eq(leads.id, id))
    .returning();

  if (!lead) throw ApiError.notFound("Lead not found");
  return lead;
}

export async function addNote(leadId: string, content: string) {
  const [note] = await db.insert(notes).values({ leadId, content }).returning();
  return note;
}

export async function updateLead(id: string, input: UpdateLeadInput) {
  if (Object.keys(input).length === 0) throw ApiError.badRequest("Provide at least one field to update");

  const [lead] = await db.update(leads).set(input).where(eq(leads.id, id)).returning();
  if (!lead) throw ApiError.notFound("Lead not found");
  return lead;
}

export async function deleteLead(id: string) {
  const [deleted] = await db.delete(leads).where(eq(leads.id, id)).returning({ id: leads.id });
  if (!deleted) throw ApiError.notFound("Lead not found");
}