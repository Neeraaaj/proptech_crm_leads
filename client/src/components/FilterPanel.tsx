"use client";

import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { LEAD_SOURCES, LEAD_STATUSES, SOURCE_LABEL, STATUS_LABEL, type LeadSource, type LeadStatus } from "../types/lead";

type Props = {
  search: string;
  onSearch: (v: string) => void;
  sources: LeadSource[];
  onSources: (v: LeadSource[]) => void;
  statuses: LeadStatus[];
  onStatuses: (v: LeadStatus[]) => void;
};

// Add the value if missing, remove it if present
const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

export function FilterPanel({ search, onSearch, sources, onSources, statuses, onStatuses }: Props) {
  const activeCount = sources.length + statuses.length + (search ? 1 : 0);

  return (
    <aside className="flex w-56 shrink-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold text-slate-900">Filter Leads by</h2>
        {activeCount > 0 && (
          <button
            className="text-xs font-medium text-blue-600 hover:underline"
            onClick={() => {
              onSearch("");
              onSources([]);
              onStatuses([]);
            }}
          >
            Clear ({activeCount})
          </button>
        )}
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400" />
          <input
            className="input py-1.5 pl-8"
            placeholder="Name or phone"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-3">
        <Section title="Status">
          {LEAD_STATUSES.map((s) => (
            <CheckRow key={s} label={STATUS_LABEL[s]} checked={statuses.includes(s)} onChange={() => onStatuses(toggle(statuses, s))} />
          ))}
        </Section>
        <Section title="Lead Source">
          {LEAD_SOURCES.map((s) => (
            <CheckRow key={s} label={SOURCE_LABEL[s]} checked={sources.includes(s)} onChange={() => onSources(toggle(sources, s))} />
          ))}
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="px-4 pt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 py-1.5 text-sm font-semibold text-slate-900"
      >
        <ChevronDown size={15} className={`transition-transform ${open ? "" : "-rotate-90"}`} />
        {title}
      </button>
      {open && <div className="space-y-0.5 pb-1 pl-1">{children}</div>}
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded px-1 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
      <input type="checkbox" className="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
