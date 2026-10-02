"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, Phone } from "lucide-react";
import type { Lead, LeadListParams } from "../types/lead";
import { PROPERTY_TYPE_LABEL, SOURCE_LABEL } from "../types/lead";
import { formatBudget, formatDateTime, formatPhone } from "../lib/format";
import { StatusBadge } from "./StatusBadge";

type SortBy = NonNullable<LeadListParams["sortBy"]>;
type Order = NonNullable<LeadListParams["order"]>;

type Props = {
  leads: Lead[];
  sortBy: SortBy;
  order: Order;
  onSort: (sortBy: SortBy) => void;
  selected: Set<string>;
  onSelectedChange: (next: Set<string>) => void;
};

export function LeadTable({ leads, sortBy, order, onSort, selected, onSelectedChange }: Props) {
  const router = useRouter();

  const allSelected = leads.length > 0 && leads.every((l) => selected.has(l.id));
  const toggleAll = () => onSelectedChange(allSelected ? new Set() : new Set(leads.map((l) => l.id)));
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectedChange(next);
  };

  const th = "border-b border-slate-200 px-3 py-2.5 text-left font-medium whitespace-nowrap text-slate-700";

  return (
    <table className="w-full border-separate border-spacing-0 text-[13.5px]">
      <thead className="sticky top-0 z-10 bg-white">
        <tr>
          <th className={`${th} w-10 pl-4`}>
            <input type="checkbox" className="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
          </th>
          <SortableTh label="Created Time" column="createdAt" sortBy={sortBy} order={order} onSort={onSort} className={th} />
          <th className={th}>Lead Name</th>
          <th className={th}>Status</th>
          <th className={th}>Mobile</th>
          <SortableTh label="Budget" column="budget" sortBy={sortBy} order={order} onSort={onSort} className={th} />
          <th className={th}>Location</th>
          <th className={th}>Property</th>
          <th className={th}>Source</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => {
          const isSelected = selected.has(lead.id);
          const td = "border-b border-slate-100 px-3 py-3 align-top whitespace-nowrap";
          return (
            <tr
              key={lead.id}
              onClick={() => router.push(`/leads/${lead.id}`)}
              className={`group cursor-pointer ${isSelected ? "bg-blue-50/60" : "hover:bg-slate-50"}`}
            >
              {/* stopPropagation: clicking the checkbox shouldn't open the lead */}
              <td className={`${td} pl-4`} onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" className="checkbox" checked={isSelected} onChange={() => toggleOne(lead.id)} />
              </td>
              <td className={`${td} text-slate-600`}>{formatDateTime(lead.createdAt)}</td>
              <td className={td}>
                <Link
                  href={`/leads/${lead.id}`}
                  className="font-medium text-slate-900 group-hover:text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {lead.name}
                </Link>
                <div className="text-xs text-slate-500">{lead.email}</div>
              </td>
              <td className={td}>
                <StatusBadge status={lead.status} />
              </td>
              <td className={td}>
                <a
                  href={`tel:+91${lead.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 hover:text-blue-600"
                  title="Call"
                >
                  {formatPhone(lead.phone)}
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Phone size={11} fill="currentColor" />
                  </span>
                </a>
              </td>
              <td className={`${td} font-medium`}>{formatBudget(lead.budget)}</td>
              <td className={td}>{lead.location}</td>
              <td className={td}>{PROPERTY_TYPE_LABEL[lead.propertyType]}</td>
              <td className={td}>{SOURCE_LABEL[lead.source]}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SortableTh({
  label,
  column,
  sortBy,
  order,
  onSort,
  className,
}: {
  label: string;
  column: SortBy;
  sortBy: SortBy;
  order: Order;
  onSort: (c: SortBy) => void;
  className: string;
}) {
  const active = sortBy === column;
  const Icon = !active ? ArrowUpDown : order === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={className} aria-sort={active ? (order === "asc" ? "ascending" : "descending") : "none"}>
      <button onClick={() => onSort(column)} className="inline-flex items-center gap-1 hover:text-blue-600">
        {label}
        <Icon size={13} className={active ? "text-blue-600" : "text-slate-400"} />
      </button>
    </th>
  );
}
