"use client";

import { useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StatusSwitch, type LeadStatus } from "@/components/admin/status-switch";
import { BUDGET_RANGE_LABELS } from "@/lib/validation/lead";
import { updateLeadStatus } from "@/app/actions/leads";
import { updateDemoLeadStatus } from "@/app/actions/demo";
import type { Lead } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type LeadsResponse = { rows: Lead[]; total: number; page: number; pageSize: number };

export function LeadsTable({ demo = false }: { demo?: boolean }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const endpoint = demo ? "/api/demo/leads" : "/api/leads";
  const queryKey = [demo ? "demo-leads" : "leads", { search, status, page }];

  const { data, isLoading, isFetching } = useQuery<LeadsResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "10" });
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      const res = await fetch(`${endpoint}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load leads");
      return res.json();
    },
    refetchInterval: 10_000, // "live-ish" polling, see plan file for why not websockets
  });

  async function handleStatusChange(leadId: string, expected: LeadStatus, toStatus: LeadStatus) {
    startTransition(async () => {
      const action = demo ? updateDemoLeadStatus : updateLeadStatus;
      const result = await action({ leadId, toStatus, expectedStatus: expected });
      if (!result.ok) {
        toast.error(
          result.reason === "conflict"
            ? "Someone else already changed this lead's status — refreshed."
            : "Couldn't update status.",
        );
      } else {
        toast.success(`Marked as ${toStatus}`);
      }
      queryClient.invalidateQueries({ queryKey: [demo ? "demo-leads" : "leads"] });
      queryClient.invalidateQueries({ queryKey: [demo ? "demo-stats" : "stats"] });
    });
  }

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="rounded-3xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, message…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          {(["all", "new", "contacted", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                status === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
          {!demo && (
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <a href="/api/leads/export">
                <Download className="size-3.5" /> Export
              </a>
            </Button>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Received</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No leads match your filters.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">
                  {lead.name}
                  {lead.duplicateOfLeadId && (
                    <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                      possible duplicate
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{lead.email}</TableCell>
                <TableCell>
                  {BUDGET_RANGE_LABELS[lead.budgetRange as keyof typeof BUDGET_RANGE_LABELS] ??
                    lead.budgetRange}
                </TableCell>
                <TableCell>{lead.score}</TableCell>
                <TableCell>
                  <StatusSwitch
                    size="sm"
                    value={lead.status as LeadStatus}
                    onChange={(next) => handleStatusChange(lead.id, lead.status as LeadStatus, next)}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t border-border p-4 text-sm text-muted-foreground">
        <span>
          {total} lead{total === 1 ? "" : "s"} {isFetching && "· refreshing…"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
