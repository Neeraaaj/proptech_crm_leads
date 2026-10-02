"use client";

import { useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Filter, Plus, RefreshCw, UsersRound } from "lucide-react";
import { Drawer } from "@/components/Drawer";
import { ErrorState } from "@/components/ErrorState";
import { FilterPanel } from "@/components/FilterPanel";
import { LeadForm } from "@/components/LeadForm";
import { LeadTable } from "@/components/LeadTable";
import { useDebounce } from "@/hooks/useDebounce";
import { useLeadList } from "@/hooks/useLeads";
import type { LeadListParams, LeadSource, LeadStatus } from "@/types/lead";

type SortBy = NonNullable<LeadListParams["sortBy"]>;
type Order = NonNullable<LeadListParams["order"]>;

const SORT_OPTIONS: { value: `${SortBy}:${Order}`; label: string }[] = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "budget:desc", label: "Budget: high → low" },
  { value: "budget:asc", label: "Budget: low → high" },
];

export default function LeadsPage() {
  const [showFilters, setShowFilters] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Filters / sort / paging state
  const [search, setSearch] = useState("");
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [order, setOrder] = useState<Order>("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(search);

  // NOTE: search/source/status are already sent to the API.
  // They start filtering as soon as you implement step 1 in lead.service.ts.
  const { data, isLoading, isFetching, error, refetch } = useLeadList({
    search: debouncedSearch || undefined,
    source: sources.length ? sources : undefined,
    status: statuses.length ? statuses : undefined,
    sortBy,
    order,
    page,
    limit,
  });

  // Wrap a setter so any filter change also resets to page 1 and clears selection
  const withReset =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
      setSelected(new Set());
    };

  // Header click: same column → flip direction; new column → start descending
  const handleHeaderSort = (column: SortBy) => {
    if (column === sortBy) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setOrder("desc");
    }
    setPage(1);
  };

  const meta = data?.meta;
  const from = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const to = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return (
    <div className="flex h-full flex-col">
      {/* View tabs */}
      <div className="flex h-11 shrink-0 items-center border-b border-slate-200 bg-white px-5">
        <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-900">All Leads</span>
      </div>

      {/* Toolbar */}
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-5">
        <div className="flex items-center gap-1">
          <button
            className={`btn-ghost ${showFilters ? "bg-slate-100" : ""}`}
            onClick={() => setShowFilters((s) => !s)}
            aria-pressed={showFilters}
          >
            <Filter size={15} />
            Filter
            {sources.length + statuses.length > 0 && (
              <span className="rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
                {sources.length + statuses.length}
              </span>
            )}
          </button>

          <label className="btn-ghost relative cursor-pointer">
            <ArrowUpDown size={15} />
            <span>Sort</span>
            <select
              className="absolute inset-0 cursor-pointer opacity-0"
              value={`${sortBy}:${order}`}
              onChange={(e) => {
                const [s, o] = e.target.value.split(":") as [SortBy, Order];
                setSortBy(s);
                setOrder(o);
                setPage(1);
              }}
              aria-label="Sort leads"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          {selected.size > 0 && (
            <span className="ml-3 text-sm text-slate-600">
              <strong className="text-slate-900">{selected.size}</strong> selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-icon" onClick={() => refetch()} title="Refresh" aria-label="Refresh">
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          </button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            Create Lead
          </button>
        </div>
      </div>

      {/* Body: filter panel + table */}
      <div className="flex min-h-0 flex-1 gap-3 p-3">
        {showFilters && (
          <FilterPanel
            search={search}
            onSearch={withReset(setSearch)}
            sources={sources}
            onSources={withReset(setSources)}
            statuses={statuses}
            onStatuses={withReset(setStatuses)}
          />
        )}

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className={`min-h-0 flex-1 overflow-auto ${isFetching && !isLoading ? "opacity-60" : ""}`}>
            {isLoading ? (
              <TableSkeleton />
            ) : error ? (
              <div className="p-5">
                <ErrorState error={error} onRetry={() => refetch()} />
              </div>
            ) : data && data.data.length === 0 ? (
              <EmptyState onCreate={() => setShowCreate(true)} />
            ) : (
              <LeadTable
                leads={data?.data ?? []}
                sortBy={sortBy}
                order={order}
                onSort={handleHeaderSort}
                selected={selected}
                onSelectedChange={setSelected}
              />
            )}
          </div>

          {/* Footer: totals + pagination */}
          <footer className="flex h-12 shrink-0 items-center justify-between border-t border-slate-200 px-4 text-sm text-slate-600">
            <span>
              Total Records <strong className="text-slate-900">{meta?.total ?? 0}</strong>
            </span>
            <div className="flex items-center gap-3">
              <select
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                aria-label="Rows per page"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
              <span className="tabular-nums">
                <strong className="text-slate-900">{from}</strong> to <strong className="text-slate-900">{to}</strong>
              </span>
              <div className="flex">
                <button className="btn-icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
                  <ChevronLeft size={17} />
                </button>
                <button
                  className="btn-icon"
                  disabled={!meta || page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </footer>
        </section>
      </div>

      <Drawer open={showCreate} onClose={() => setShowCreate(false)} title="Create Lead">
        <LeadForm onSuccess={() => setShowCreate(false)} />
      </Drawer>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-8 animate-pulse rounded bg-slate-100" />
      ))}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <UsersRound size={22} />
      </span>
      <div>
        <p className="font-medium text-slate-900">No leads match these filters</p>
        <p className="text-sm text-slate-500">Try clearing filters, or add a new lead.</p>
      </div>
      <button className="btn-primary" onClick={onCreate}>
        <Plus size={16} />
        Create Lead
      </button>
    </div>
  );
}
