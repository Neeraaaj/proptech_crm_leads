"use client";

import { ErrorState } from "@/components/ErrorState";
import { useDashboardStats } from "@/hooks/useLeads";

/**
 * 🚧 STEP 5
 * Hook is wired to GET /api/dashboard/stats (returns 501 until implemented on the server).
 *
 * TODO(step 5):
 *  - Row of 4 stat cards: Total leads · Conversion rate (as %) · Closed · Site visits
 *  - "Leads by source": recharts <BarChart> over stats.bySource (label with SOURCE_LABEL)
 *  - "Status distribution": <PieChart> or horizontal bars over stats.byStatus
 *  - Empty state when totalLeads === 0
 */
export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  return (
    <div className="space-y-6 p-5">
      {/* Title is shown in the TopBar */}
      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <ErrorState error={error} />}
      {stats && <pre className="card overflow-auto text-xs">{JSON.stringify(stats, null, 2)}</pre>}
    </div>
  );
}
