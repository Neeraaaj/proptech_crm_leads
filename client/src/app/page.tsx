"use client";

import Link from "next/link";
import { ArrowRight, Building2, Clock, Home, MapPin, Phone, Plus, Star, UsersRound } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { useDashboardStats } from "@/hooks/useLeads";
import { daysAgo, formatBudget, formatPhone } from "@/lib/format";
import {
  PROPERTY_TYPE_LABEL,
  SOURCE_LABEL,
  STATUS_LABEL,
  type DashboardStats,
  type LeadCard,
} from "@/types/lead";

/* Palette — warm neutral canvas, deep green + near-black feature cards, one lime accent */
const LIME = "#c6f36b";

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) return <DashboardSkeleton />;
  if (error || !stats)
    return (
      <div className="p-5">
        <ErrorState error={error} />
      </div>
    );

  return (
    <div className="min-h-full bg-white p-6">
      {/* ── Headline ─────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-slate-900">
            {stats.totalLeads} leads.
          </h1>
          <p className="text-4xl leading-tight font-semibold tracking-tight text-slate-400">
            {formatBudget(stats.pipelineValue)} in open pipeline.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/leads"
            className="rounded-full border border-slate-900 px-5 py-2 text-sm font-medium text-slate-900 hover:bg-white"
          >
            View all leads
          </Link>
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={15} /> Add lead
          </Link>
        </div>
      </div>

      {/* ── Status summary pills ─────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap gap-2">
        <Pill dark>All {stats.totalLeads}</Pill>
        {stats.byStatus.map((s) => (
          <Pill key={s.status}>
            {STATUS_LABEL[s.status]} {s.count}
          </Pill>
        ))}
      </div>

      {stats.totalLeads === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Row 1 */}
          <div className="md:col-span-2">
            {stats.topLead ? <FeaturedLead lead={stats.topLead} /> : <EmptyCard text="No open leads" />}
          </div>
          <ConversionCard stats={stats} />
          <AttentionCard attention={stats.needsAttention} />

          {/* Row 2 */}
          {stats.recentLeads.map((lead) => (
            <RecentLeadCard key={lead.id} lead={lead} />
          ))}
          <SourceCard stats={stats} />
        </div>
      )}
    </div>
  );
}

/* ── Featured: highest-budget open lead ──────────────────────────── */
function FeaturedLead({ lead }: { lead: LeadCard }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white">
      <PropertyBanner lead={lead} tall>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white">
          <Star size={12} fill="currentColor" /> Top lead by budget
        </span>
      </PropertyBanner>
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{lead.name}</h2>
            <p className="text-sm text-slate-500">
              {PROPERTY_TYPE_LABEL[lead.propertyType]} · {lead.location} · {SOURCE_LABEL[lead.source]} · added{" "}
              {daysAgo(lead.createdAt)}
            </p>
          </div>
          <p className="text-xl font-semibold text-emerald-700">{formatBudget(lead.budget)}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Chip>{STATUS_LABEL[lead.status]}</Chip>
            <Chip>
              <Phone size={12} /> {formatPhone(lead.phone)}
            </Chip>
          </div>
          <Link
            href={`/leads/${lead.id}`}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            View lead
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ── Conversion: big number + pipeline bars (Closed highlighted) ─── */
function ConversionCard({ stats }: { stats: DashboardStats }) {
  const closed = stats.byStatus.find((s) => s.status === "CLOSED")?.count ?? 0;
  const max = Math.max(1, ...stats.byStatus.map((s) => s.count));

  return (
    <article className="flex flex-col rounded-2xl bg-[#0f3d2e] p-5 text-white">
      <p className="text-xs font-medium tracking-wider text-white/60 uppercase">Conversion rate</p>
      <p className="mt-2 text-5xl font-semibold tracking-tight">{(stats.conversionRate * 100).toFixed(1)}%</p>
      <p className="mt-1 text-sm text-white/70">
        <span style={{ color: LIME }}>{closed}</span> of {stats.totalLeads} leads closed
      </p>

      {/* Pipeline: one bar per status, Closed in the accent colour */}
      <div className="mt-5 flex flex-1 items-end gap-2" role="img" aria-label="Leads per pipeline stage">
        {stats.byStatus.map((s) => {
          const isClosed = s.status === "CLOSED";
          return (
            <div key={s.status} className="group flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span className="text-xs text-white/70 tabular-nums">{s.count}</span>
              <div
                title={`${STATUS_LABEL[s.status]}: ${s.count}`}
                className="w-full rounded-t-[4px] transition group-hover:opacity-90"
                style={{
                  height: `${Math.max(6, (s.count / max) * 120)}px`,
                  background: isClosed ? LIME : "rgba(255,255,255,0.22)",
                }}
              />
              <span className="text-center text-[11px] whitespace-nowrap text-white/60">{STATUS_LABEL[s.status]}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

/* ── Needs attention: NEW leads waiting the longest ──────────────── */
function AttentionCard({ attention }: { attention: DashboardStats["needsAttention"] }) {
  return (
    <article className="flex flex-col rounded-2xl bg-[#161a17] p-5 text-white">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-wider text-white/60 uppercase">Needs attention</p>
        <span className="rounded-md bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-300">
          {attention.count}
        </span>
      </div>
      <p className="mt-1 text-xs text-white/40">New leads not yet contacted, oldest first</p>

      <ul className="mt-4 flex-1 divide-y divide-white/10">
        {attention.leads.length === 0 && <li className="py-3 text-sm text-white/60">All caught up 🎉</li>}
        {attention.leads.map((l) => (
          <li key={l.id}>
            <Link href={`/leads/${l.id}`} className="flex items-start gap-3 py-3 hover:opacity-80">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
              <span>
                <span className="block text-sm font-medium">{l.name}</span>
                <span className="block text-xs text-white/50">
                  Added {daysAgo(l.createdAt)} · {SOURCE_LABEL[l.source]}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/leads"
        className="mt-3 rounded-full border border-white/15 py-2 text-center text-sm font-medium hover:bg-white/5"
        style={{ color: LIME }}
      >
        Review all
      </Link>
    </article>
  );
}

/* ── Recent lead card ────────────────────────────────────────────── */
function RecentLeadCard({ lead }: { lead: LeadCard }) {
  return (
    <Link href={`/leads/${lead.id}`} className="group overflow-hidden rounded-2xl bg-white transition hover:shadow-md">
      <PropertyBanner lead={lead}>
        <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white">Recent</span>
      </PropertyBanner>
      <div className="space-y-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 group-hover:text-emerald-800">{lead.name}</h3>
          <span className="font-semibold text-emerald-700">{formatBudget(lead.budget)}</span>
        </div>
        <p className="text-xs text-slate-500">
          {PROPERTY_TYPE_LABEL[lead.propertyType]} · {SOURCE_LABEL[lead.source]}
        </p>
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={12} /> {lead.location}
        </p>
        <p className="flex items-center gap-1 pt-1 text-xs font-medium text-emerald-700">
          <Clock size={12} /> {STATUS_LABEL[lead.status]} · added {daysAgo(lead.createdAt)}
        </p>
      </div>
    </Link>
  );
}

/* ── Leads by source: horizontal bars ────────────────────────────── */
function SourceCard({ stats }: { stats: DashboardStats }) {
  const max = Math.max(1, ...stats.bySource.map((s) => s.count));
  const sorted = [...stats.bySource].sort((a, b) => b.count - a.count);

  return (
    <article className="rounded-2xl bg-white p-5 md:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider text-slate-700 uppercase">Leads by source</p>
        <Link href="/leads" className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900">
          Open leads <ArrowRight size={12} />
        </Link>
      </div>
      <ul className="space-y-2.5">
        {sorted.map((s) => (
          <li key={s.source} className="grid grid-cols-[84px_1fr_32px] items-center gap-3 text-sm" title={`${SOURCE_LABEL[s.source]}: ${s.count}`}>
            <span className="text-slate-600">{SOURCE_LABEL[s.source]}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <span
                className="block h-full rounded-full bg-emerald-700"
                style={{ width: `${(s.count / max) * 100}%` }}
              />
            </span>
            <span className="text-right font-medium text-slate-900 tabular-nums">{s.count}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ── Building blocks ─────────────────────────────────────────────── */

/** Stand-in for a property photo: tinted panel with an icon + property type (no fake images). */
function PropertyBanner({ lead, tall, children }: { lead: LeadCard; tall?: boolean; children?: React.ReactNode }) {
  const isPlot = lead.propertyType === "PLOT";
  const isCommercial = lead.propertyType === "COMMERCIAL";
  const Icon = isCommercial ? Building2 : Home;
  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br from-emerald-50 via-[#e8efe6] to-[#d7e4d4] ${
        tall ? "h-48" : "h-28"
      }`}
    >
      <div className="flex flex-col items-center gap-1 text-emerald-900/40">
        <Icon size={tall ? 44 : 30} strokeWidth={1.5} />
        <span className="text-xs font-medium tracking-wide uppercase">
          {isPlot ? "Plot" : PROPERTY_TYPE_LABEL[lead.propertyType]}
        </span>
      </div>
      <div className="absolute top-3 left-3">{children}</div>
    </div>
  );
}

function Pill({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={`rounded-full px-4 py-1.5 text-sm font-medium ${
        dark ? "bg-slate-900 text-white" : "bg-white text-slate-700"
      }`}
    >
      {children}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
      {children}
    </span>
  );
}

function EmptyCard({ text }: { text: string }) {
  return <div className="flex h-full items-center justify-center rounded-2xl bg-white p-10 text-sm text-slate-500">{text}</div>;
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white py-16 text-center">
      <UsersRound className="mx-auto mb-3 text-slate-300" size={32} />
      <p className="font-medium text-slate-900">No leads yet</p>
      <p className="mb-4 text-sm text-slate-500">Metrics appear once you add your first lead.</p>
      <Link href="/leads" className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white">
        Go to Leads
      </Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-full space-y-4 bg-[#f1efe8] p-6">
      <div className="h-24 w-96 animate-pulse rounded-xl bg-white/60" />
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="h-80 animate-pulse rounded-2xl bg-white/60 lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl bg-white/60" />
        <div className="h-80 animate-pulse rounded-2xl bg-white/60" />
      </div>
    </div>
  );
}