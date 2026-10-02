import { STATUS_LABEL, type LeadStatus } from "../types/lead";

const styles: Record<LeadStatus, string> = {
  NEW: "bg-sky-100 text-sky-800",
  CONTACTED: "bg-amber-100 text-amber-800",
  SITE_VISIT: "bg-violet-100 text-violet-800",
  CLOSED: "bg-emerald-100 text-emerald-800",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
