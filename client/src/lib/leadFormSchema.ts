import { z } from "zod";
import { LEAD_SOURCES, PROPERTY_TYPES } from "../types/lead";

// Same rules as server/src/modules/leads/lead.schema.ts.
// Client validation = fast feedback; server validation = the actual guarantee.
export const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+91[\s-]?|0)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email("Enter a valid email"),
  budget: z.coerce
    .number({ invalid_type_error: "Budget is required" })
    .int("Whole rupees only")
    .positive("Budget must be greater than 0"),
  location: z.string().trim().min(2, "Location is required").max(120),
  propertyType: z.enum(PROPERTY_TYPES, { errorMap: () => ({ message: "Pick a property type" }) }),
  source: z.enum(LEAD_SOURCES, { errorMap: () => ({ message: "Pick a lead source" }) }),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
