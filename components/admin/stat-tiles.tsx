"use client";

import { useQuery } from "@tanstack/react-query";
import { RollingCounter } from "@/components/design/rolling-counter";

type Stats = {
  total: number;
  new: number;
  contacted: number;
  closed: number;
  avgScore: number;
  spam: number;
};

const TILES: Array<{ key: keyof Stats; label: string }> = [
  { key: "total", label: "Total leads" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "closed", label: "Closed" },
  { key: "avgScore", label: "Avg. score" },
];

export function StatTiles({ demo = false }: { demo?: boolean }) {
  const { data } = useQuery<Stats>({
    queryKey: [demo ? "demo-stats" : "stats"],
    queryFn: async () => {
      const res = await fetch(demo ? "/api/demo/stats" : "/api/leads/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
    refetchInterval: 10_000,
  });

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {TILES.map((tile) => (
        <div key={tile.key} className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{tile.label}</p>
          <RollingCounter value={data?.[tile.key] ?? 0} fontSize={28} className="mt-1 font-heading font-semibold" />
        </div>
      ))}
    </div>
  );
}
