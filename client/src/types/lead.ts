// Mirrors the Prisma enums on the server. If you add a value there, add it here too.
// (Possible upgrade: a shared `packages/types` workspace so this can't drift.)

export const PROPERTY_TYPES = ["BHK_1", "BHK_2", "BHK_3", "BHK_4_PLUS", "PLOT", "VILLA", "COMMERCIAL"] as const;
export const LEAD_SOURCES = ["FACEBOOK", "GOOGLE", "REFERRAL", "WEBSITE", "WALK_IN", "OTHER"] as const;
export const LEAD_STATUSES = ["NEW", "CONTACTED", "SITE_VISIT", "CLOSED"] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  BHK_1: "1 BHK",
  BHK_2: "2 BHK",
  BHK_3: "3 BHK",
  BHK_4_PLUS: "4+ BHK",
  PLOT: "Plot",
  VILLA: "Villa",
  COMMERCIAL: "Commercial",
};

export const SOURCE_LABEL: Record<LeadSource, string> = {
  FACEBOOK: "Facebook",
  GOOGLE: "Google",
  REFERRAL: "Referral",
  WEBSITE: "Website",
  WALK_IN: "Walk-in",
  OTHER: "Other",
};

export const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  SITE_VISIT: "Site Visit",
  CLOSED: "Closed",
};

export interface Note {
  id: string;
  content: string;
  leadId: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  budget: number;
  location: string;
  propertyType: PropertyType;
  source: LeadSource;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  notes?: Note[];
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeadListParams {
  search?: string;
  source?: LeadSource[];
  status?: LeadStatus[];
  sortBy?: "createdAt" | "budget";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export type CreateLeadPayload = Pick<Lead, "name" | "phone" | "email" | "budget" | "location" | "propertyType" | "source">;

export interface DashboardStats {
  totalLeads: number;
  bySource: { source: LeadSource; count: number }[];
  byStatus: { status: LeadStatus; count: number }[];
  conversionRate: number;
}
