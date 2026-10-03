import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardApi, leadsApi } from "../api/leads";
import type { CreateLeadPayload, LeadListParams, LeadStatus } from "../types/lead";

/**
 * Query keys are hierarchical: invalidating ["leads"] refreshes every list *and* detail.
 * Think of it like a cache folder tree — delete the folder, everything inside refetches.
 */
export const leadKeys = {
  all: ["leads"] as const,
  list: (params: LeadListParams) => ["leads", "list", params] as const,
  detail: (id: string) => ["leads", "detail", id] as const,
  stats: ["dashboard", "stats"] as const,
};

// ✅ WORKING
export function useLeadList(params: LeadListParams) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => leadsApi.list(params),
    placeholderData: keepPreviousData, // no table flicker while typing/filtering
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeadPayload) => leadsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: leadKeys.stats });
    },
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadsApi.get(id).then((r) => r.data),
    retry: false,
  });
}

export function useUpdateLead(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (changes: Partial<CreateLeadPayload>) => leadsApi.update(id, changes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: leadKeys.stats });
    },
  });
}

export function useUpdateStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: LeadStatus) => leadsApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: leadKeys.stats });
    },
  });
}

export function useDeleteLead(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: leadKeys.stats });
    },
  })
}

export function useAddNote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => leadsApi.addNote(id, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: leadKeys.detail(id) }),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: leadKeys.stats,
    queryFn: () => dashboardApi.stats().then((r) => r.data),
    retry: false,
  });
}
