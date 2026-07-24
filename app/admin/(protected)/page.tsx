import { StatTiles } from "@/components/admin/stat-tiles";
import { LeadsChart } from "@/components/admin/leads-chart";
import { LeadsTable } from "@/components/admin/leads-table";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Every lead, live-ish — refreshes every 10 seconds.</p>
      </div>
      <StatTiles />
      <LeadsChart />
      <LeadsTable />
    </div>
  );
}
