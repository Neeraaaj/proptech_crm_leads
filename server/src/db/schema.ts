import { relations } from "drizzle-orm";
import { bigint, index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// ── Enums ───────────────────────────────────────────────────────────────────
// `.enumValues` on each is reused by Zod, so validation and DB can't drift.
export const propertyTypeEnum = pgEnum("property_type", [
  "BHK_1",
  "BHK_2",
  "BHK_3",
  "BHK_4_PLUS",
  "PLOT",
  "VILLA",
  "COMMERCIAL",
]);
export const leadSourceEnum = pgEnum("lead_source", ["FACEBOOK", "GOOGLE", "REFERRAL", "WEBSITE", "WALK_IN", "OTHER"]);
export const leadStatusEnum = pgEnum("lead_status", ["NEW", "CONTACTED", "SITE_VISIT", "CLOSED"]);

// ── Tables ──────────────────────────────────────────────────────────────────
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 10 }).notNull(), // normalized 10 digits
    email: varchar("email", { length: 255 }).notNull(),
    budget: bigint("budget", { mode: "number" }).notNull(), // whole rupees
    location: varchar("location", { length: 120 }).notNull(),
    propertyType: propertyTypeEnum("property_type").notNull(),
    source: leadSourceEnum("source").notNull(),
    status: leadStatusEnum("status").notNull().default("NEW"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  // Indexes match the list page's filter/sort columns.
  (t) => [
    index("leads_status_idx").on(t.status),
    index("leads_source_idx").on(t.source),
    index("leads_created_at_idx").on(t.createdAt),
    index("leads_budget_idx").on(t.budget),
    index("leads_phone_idx").on(t.phone),
  ],
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notes_lead_id_created_at_idx").on(t.leadId, t.createdAt)],
);

// ── Relations (enables db.query.leads.findFirst({ with: { notes: true } })) ─
export const leadsRelations = relations(leads, ({ many }) => ({ notes: many(notes) }));
export const notesRelations = relations(notes, ({ one }) => ({
  lead: one(leads, { fields: [notes.leadId], references: [leads.id] }),
}));

// ── Inferred types ──────────────────────────────────────────────────────────
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type LeadStatus = (typeof leadStatusEnum.enumValues)[number];
