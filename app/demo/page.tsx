import { StatTiles } from "@/components/admin/stat-tiles";
import { LeadsChart } from "@/components/admin/leads-chart";
import { LeadsTable } from "@/components/admin/leads-table";

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Demo dashboard</h1>
        <p className="text-sm text-muted-foreground">
          This is the exact admin experience LeadDesk ships — try searching, filtering, and changing a
          status below. Nothing here is real customer data, and it resets on a schedule.
        </p>
      </div>
      <StatTiles demo />
      <LeadsChart demo />
      <LeadsTable demo />
    </div>
  );
}
