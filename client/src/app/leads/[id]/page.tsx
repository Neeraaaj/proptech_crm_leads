"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ErrorState } from "@/components/ErrorState";
import { StatusBadge } from "@/components/StatusBadge";
import { useLead } from "@/hooks/useLeads";
import { formatBudget, formatDate, formatPhone } from "@/lib/format";
import { PROPERTY_TYPE_LABEL, SOURCE_LABEL } from "@/types/lead";

/**
 * 🚧 STEPS 2 + 3
 * Data fetching is wired. Until GET /api/leads/:id is implemented you'll see the "Not implemented" banner.
 *
 * TODO(step 3):
 *  - <StatusSelect>: a <select> of LEAD_STATUSES → useUpdateStatus(id).mutate(status)
 *  - <NotesPanel>: textarea + "Add note" → useAddNote(id); list lead.notes newest-first with formatDate
 *  - Disable controls while mutation.isPending; show mutation.error with <ErrorState>
 */
export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lead, isLoading, error } = useLead(id);

  return (
    <div className="space-y-6 p-5">
      <Link href="/leads" className="text-sm text-indigo-600 hover:underline">
        ← Back to leads
      </Link>

      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <ErrorState error={error} />}

      {lead && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-semibold">{lead.name}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Phone" value={formatPhone(lead.phone)} />
              <Info label="Email" value={lead.email} />
              <Info label="Budget" value={formatBudget(lead.budget)} />
              <Info label="Location" value={lead.location} />
              <Info label="Property type" value={PROPERTY_TYPE_LABEL[lead.propertyType]} />
              <Info label="Source" value={SOURCE_LABEL[lead.source]} />
              <Info label="Created" value={formatDate(lead.createdAt)} />
            </dl>
          </div>

          <div className="card space-y-4">
            <h2 className="font-medium">Status</h2>
            <p className="text-sm text-slate-500">TODO: status dropdown (step 3)</p>
            <h2 className="font-medium">Notes</h2>
            <p className="text-sm text-slate-500">TODO: notes list + add form (step 3)</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
