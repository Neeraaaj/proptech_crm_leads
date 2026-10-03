"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Trash2,
  User,
} from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { StatusBadge } from "@/components/StatusBadge";
import {
  useAddNote,
  useDeleteLead,
  useLead,
  useUpdateStatus,
} from "@/hooks/useLeads";
import {
  formatBudget,
  formatDateTime,
  formatPhone,
} from "@/lib/format";

import { EditableRow } from "@/components/EditableRow";

import {
  LEAD_STATUSES,
  PROPERTY_TYPE_LABEL,
  SOURCE_LABEL,
  STATUS_LABEL,
  type Lead,
  type LeadStatus,
  type Note,
} from "@/types/lead";

type Tab = "overview" | "notes";

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: lead, isLoading, error } = useLead(id);

  const [tab, setTab] = useState<Tab>("overview");
  const [showMenu, setShowMenu] = useState(false);

  const deleteLead = useDeleteLead();

  function handleDelete() {
    if (!lead) return;

    if (!confirm(`Delete ${lead.name}? This also removes their notes.`)) {
      return;
    }

    deleteLead.mutate(lead.id, {
      onSuccess: () => router.push("/leads"),
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="text-sm text-slate-500">Loading lead...</div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="space-y-4 p-6">
        <BackLink />
        <ErrorState error={error} />
      </div>
    );
  }

  const notes = lead.notes ?? [];

  return (
    <div className="min-h-full bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <BackLink />

            {/* Avatar */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-semibold text-blue-700">
              {lead.name.charAt(0).toUpperCase()}
            </div>

            {/* Identity */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-semibold text-slate-900">
                  {lead.name}
                </h1>

                <StatusBadge status={lead.status} />
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin size={14} />
                {lead.location}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex shrink-0 items-center gap-2">
            <a
              href={`tel:+91${lead.phone}`}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              <Phone size={15} />
              <span className="hidden sm:inline">Call</span>
            </a>

            <a
              href={`mailto:${lead.email}`}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Mail size={15} />
              <span className="hidden sm:inline">Email</span>
            </a>

            <button
              onClick={() => setShowMenu((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              aria-label="More actions"
            >
              <MoreHorizontal size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-11 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={15} />
                  Delete lead
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-6">
            <PageTab
              active={tab === "overview"}
              onClick={() => setTab("overview")}
              icon={<User size={15} />}
            >
              Overview
            </PageTab>

            <PageTab
              active={tab === "notes"}
              onClick={() => setTab("notes")}
              icon={<MessageSquare size={15} />}
              count={notes.length}
            >
              Notes
            </PageTab>
          </div>
        </div>

        {tab === "overview" ? (
          <div className="space-y-6">
            {/* Pipeline */}
            <PipelineCard lead={lead} />

            {/* Main information */}
            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <LeadInformationCard lead={lead} />
              <LeadSummaryCard lead={lead} />
            </div>

            {/* Timestamps */}
            <div className="grid gap-4 sm:grid-cols-2">
              <MetaCard
                icon={<CalendarDays size={16} />}
                label="Created"
                value={formatDateTime(lead.createdAt)}
              />

              <MetaCard
                icon={<Clock size={16} />}
                label="Last updated"
                value={formatDateTime(lead.updatedAt)}
              />
            </div>
          </div>
        ) : (
          <NotesCard leadId={lead.id} notes={notes} />
        )}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pipeline                                                                   */
/* -------------------------------------------------------------------------- */

function PipelineCard({ lead }: { lead: Lead }) {
  const updateStatus = useUpdateStatus(lead.id);

  const currentIndex = LEAD_STATUSES.indexOf(lead.status);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Lead Pipeline
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Move the lead through the sales journey
          </p>
        </div>

        {updateStatus.isPending && (
          <span className="text-xs text-slate-500">Updating...</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[620px] items-center">
          {LEAD_STATUSES.map((status, index) => {
            const isCurrent = status === lead.status;
            const isCompleted = index < currentIndex;

            return (
              <div key={status} className="flex flex-1 items-center">
                <button
                  disabled={updateStatus.isPending || isCurrent}
                  onClick={() =>
                    updateStatus.mutate(status as LeadStatus)
                  }
                  className="group flex items-center gap-3 text-left"
                >
                  <span
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition",
                      isCurrent
                        ? "border-blue-600 bg-blue-600 text-white"
                        : isCompleted
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 bg-white text-slate-400 group-hover:border-blue-400 group-hover:text-blue-600",
                    ].join(" ")}
                  >
                    {isCompleted ? <Check size={15} /> : index + 1}
                  </span>

                  <span>
                    <span
                      className={[
                        "block text-sm font-medium",
                        isCurrent
                          ? "text-blue-700"
                          : isCompleted
                            ? "text-slate-700"
                            : "text-slate-400",
                      ].join(" ")}
                    >
                      {STATUS_LABEL[status]}
                    </span>

                    {isCurrent && (
                      <span className="text-xs text-slate-400">
                        Current stage
                      </span>
                    )}
                  </span>
                </button>

                {index < LEAD_STATUSES.length - 1 && (
                  <ChevronRight
                    size={17}
                    className="mx-4 shrink-0 text-slate-300"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {updateStatus.isError && (
        <p className="mt-4 text-xs text-red-600">
          {updateStatus.error.message}
        </p>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Lead information                                                           */
/* -------------------------------------------------------------------------- */

function LeadInformationCard({ lead }: { lead: Lead }) {
  const id = lead.id;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">
          Lead Information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Contact and property details
        </p>
      </div>

      <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
        <EditableRow
          leadId={id}
          label="Lead Name"
          field="name"
          value={lead.name}
          display={lead.name}
        />

        <EditableRow
          leadId={id}
          label="Location"
          field="location"
          value={lead.location}
          display={
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" />
              {lead.location}
            </span>
          }
        />

        <EditableRow
          leadId={id}
          label="Email"
          field="email"
          inputType="email"
          value={lead.email}
          display={
            <a
              href={`mailto:${lead.email}`}
              className="text-blue-600 hover:underline"
            >
              {lead.email}
            </a>
          }
        />

        <EditableRow
          leadId={id}
          label="Mobile"
          field="phone"
          inputType="tel"
          value={lead.phone}
          display={
            <a
              href={`tel:+91${lead.phone}`}
              className="inline-flex items-center gap-2 text-slate-900 hover:text-blue-600"
            >
              +91 {formatPhone(lead.phone)}
              <Phone size={14} className="text-emerald-500" />
            </a>
          }
        />

        <EditableRow
          leadId={id}
          label="Property Type"
          field="propertyType"
          value={lead.propertyType}
          display={PROPERTY_TYPE_LABEL[lead.propertyType]}
          options={PROPERTY_TYPE_LABEL}
        />

        <EditableRow
          leadId={id}
          label="Lead Source"
          field="source"
          value={lead.source}
          display={SOURCE_LABEL[lead.source]}
          options={SOURCE_LABEL}
        />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

function LeadSummaryCard({ lead }: { lead: Lead }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">
          Lead Summary
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Key information at a glance
        </p>
      </div>

      {/* Budget */}
      <div className="rounded-xl bg-blue-50 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
          Budget
        </p>

        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          {formatBudget(lead.budget)}
        </p>
      </div>

      <div className="mt-5 divide-y divide-slate-100">
        <SummaryRow
          label="Property Type"
          value={PROPERTY_TYPE_LABEL[lead.propertyType]}
        />

        <SummaryRow
          label="Lead Source"
          value={SOURCE_LABEL[lead.source]}
        />

        <SummaryRow
          label="Current Status"
          value={<StatusBadge status={lead.status} />}
        />
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Meta                                                                       */
/* -------------------------------------------------------------------------- */

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Notes                                                                      */
/* -------------------------------------------------------------------------- */

function NotesCard({
  leadId,
  notes,
}: {
  leadId: string;
  notes: Note[];
}) {
  const [content, setContent] = useState("");
  const addNote = useAddNote(leadId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) return;

    addNote.mutate(content, {
      onSuccess: () => setContent(""),
    });
  }

  return (
    <section className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">
          Notes & Activity
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Keep track of conversations and follow-ups.
        </p>
      </div>

      {/* Add note */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          rows={4}
          placeholder="Add a note... e.g. Called, wants a site visit on Saturday"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={addNote.isPending}
        />

        <div className="mt-3 flex items-center justify-between">
          {addNote.isError ? (
            <p className="text-xs text-red-600">
              {addNote.error.message}
            </p>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={addNote.isPending || !content.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {addNote.isPending ? "Adding..." : "Add note"}
          </button>
        </div>
      </form>

      {/* Timeline */}
      {notes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
          <MessageSquare
            size={24}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 text-sm font-medium text-slate-600">
            No notes yet
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Add the first note above.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {notes.map((note) => (
            <div key={note.id} className="flex gap-3">
              <div className="relative flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <MessageSquare size={14} />
                </div>

                <div className="absolute top-9 h-full w-px bg-slate-100" />
              </div>

              <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {note.content}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  {formatDateTime(note.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Small components                                                           */
/* -------------------------------------------------------------------------- */

function PageTab({
  active,
  onClick,
  icon,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition",
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-slate-500 hover:text-slate-800",
      ].join(" ")}
    >
      {icon}

      {children}

      {count !== undefined && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
          {count}
        </span>
      )}
    </button>
  );
}

function BackLink() {
  return (
    <Link
      href="/leads"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      aria-label="Back to leads"
      title="Back to leads"
    >
      <ArrowLeft size={18} />
    </Link>
  );
}