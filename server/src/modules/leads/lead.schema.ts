import { z } from "zod";
import { leadSourceEnum, leadStatusEnum, propertyTypeEnum } from "../../db/schema.js";

// Indian mobile: optional +91 / 0 prefix, then 10 digits starting 6-9.
const phoneRegex = /^(?:\+91[\s-]?|0)?[6-9]\d{9}$/;

// Enum values come straight from the DB schema → single source of truth.
const propertyType = z.enum(propertyTypeEnum.enumValues);
const source = z.enum(leadSourceEnum.enumValues);
const status = z.enum(leadStatusEnum.enumValues);

export const createLeadSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid 10-digit Indian mobile number")
    .transform((p) => p.replace(/\D/g, "").slice(-10)), // store normalized 10 digits
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  budget: z.coerce.number().int().positive("Budget must be greater than 0").max(100_000_000_000),
  location: z.string().trim().min(2).max(120),
  propertyType,
  source,
});

// Used by PATCH /leads/:id (step 4)
export const updateLeadSchema = createLeadSchema.partial();

export const updateStatusSchema = z.object({ status });

export const createNoteSchema = z.object({
  content: z.string().trim().min(1, "Note cannot be empty").max(2000),
});

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid lead id"),
});

// "GOOGLE,FACEBOOK" → ["GOOGLE", "FACEBOOK"] (multi-select filters from the checkbox panel)
const csvOf = <T extends [string, ...string[]]>(e: z.ZodEnum<T>) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").filter(Boolean) : undefined))
    .pipe(z.array(e).optional());

export const listLeadsQuerySchema = z.object({
  search: z.string().trim().optional(), // matches name OR phone
  source: csvOf(source), // string[] | undefined
  status: csvOf(status), // string[] | undefined
  sortBy: z.enum(["createdAt", "budget"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
