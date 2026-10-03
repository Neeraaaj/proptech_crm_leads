import { request } from "./client";
import type {
  CreateLeadPayload,
  DashboardStats,
  Lead,
  LeadListParams,
  LeadStatus,
  Note,
  PageMeta,
} from "../types/lead";

type One<T> = { data: T };
type Many<T> = { data: T[]; meta: PageMeta };

export const leadsApi = {
  list: ({ source, status, ...rest }: LeadListParams) =>
    request<Many<Lead>>("/leads", {
      // arrays go over the wire as comma-separated values: ?source=GOOGLE,FACEBOOK
      query: { ...rest, source: source?.join(","), status: status?.join(",") },
    }),
  create: (payload: CreateLeadPayload) => request<One<Lead>>("/leads", { method: "POST", body: payload }),
  get: (id: string) => request<One<Lead>>(`/leads/${id}`),
  updateStatus: (id: string, status: LeadStatus) =>
    request<One<Lead>>(`/leads/${id}/status`, { method: "PATCH", body: { status } }),
  addNote: (id: string, content: string) =>
    request<One<Note>>(`/leads/${id}/notes`, { method: "POST", body: { content } }),
  update: (id: string, changes: Partial<CreateLeadPayload>) =>
    request<One<Lead>>(`/leads/${id}`, { method: "PATCH", body: changes }),
  remove: (id: string) => request<void>(`/leads/${id}`, { method: "DELETE" }),
};

export const dashboardApi = {
  stats: () => request<One<DashboardStats>>("/dashboard/stats"),
};
