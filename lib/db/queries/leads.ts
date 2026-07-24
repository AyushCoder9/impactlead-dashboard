import { and, desc, eq, gte, ilike, or, sql, count } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads, leadStatusHistory, type Lead, type NewLead } from "@/lib/db/schema";
import { DUPLICATE_WINDOW_MS } from "@/lib/spam/duplicate";

// This is the ONLY file allowed to build raw queries against `leads` /
// `lead_status_history` — every other module goes through these exported
// functions. This is what keeps real vs. demo data isolated by construction
// rather than by convention. See CLAUDE.md.

export type LeadFilters = {
  search?: string;
  status?: "new" | "contacted" | "closed";
  includeSpam?: boolean;
  page?: number;
  pageSize?: number;
};

function scopeCondition(demo: boolean) {
  return eq(leads.isDemo, demo);
}

async function listLeads(demo: boolean, filters: LeadFilters = {}) {
  const db = getDb();
  const { search, status, includeSpam = false, page = 1, pageSize = 25 } = filters;

  const conditions = [scopeCondition(demo)];
  if (!includeSpam) conditions.push(eq(leads.isSpam, false));
  if (status) conditions.push(eq(leads.status, status));
  if (search && search.trim().length > 0) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(leads.name, term),
        ilike(leads.email, term),
        ilike(leads.message, term),
      )!,
    );
  }

  const where = and(...conditions);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(where)
      .orderBy(desc(leads.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(leads).where(where),
  ]);

  return { rows, total: Number(total), page, pageSize };
}

export function getRealLeads(filters?: LeadFilters) {
  return listLeads(false, filters);
}

export function getDemoLeads(filters?: LeadFilters) {
  return listLeads(true, filters);
}

async function findRecentDuplicate(demo: boolean, email: string) {
  const db = getDb();
  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);
  const rows = await db
    .select({ id: leads.id })
    .from(leads)
    .where(
      and(
        scopeCondition(demo),
        eq(leads.email, email),
        gte(leads.createdAt, since),
      ),
    )
    .orderBy(desc(leads.createdAt))
    .limit(1);
  return rows[0]?.id;
}

export async function insertLead(
  data: Omit<NewLead, "isDemo" | "duplicateOfLeadId">,
  opts: { demo: boolean },
): Promise<Lead> {
  const db = getDb();
  const duplicateOfLeadId = await findRecentDuplicate(opts.demo, data.email);

  const [row] = await db
    .insert(leads)
    .values({
      ...data,
      isDemo: opts.demo,
      duplicateOfLeadId: duplicateOfLeadId ?? null,
    })
    .returning();

  return row!;
}

/**
 * Transactional status update + audit row, guarded by a `WHERE status =
 * $expected` conditional so two concurrent admins (or an optimistic
 * double-click) can't both "win" and log a bogus transition.
 */
export async function updateLeadStatus(
  leadId: string,
  opts: {
    demo: boolean;
    toStatus: "new" | "contacted" | "closed";
    expectedStatus?: "new" | "contacted" | "closed";
    changedBy?: string | null;
    note?: string;
  },
): Promise<{ ok: true; lead: Lead } | { ok: false; reason: "not_found" | "conflict" }> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const conditions = [eq(leads.id, leadId), scopeCondition(opts.demo)];
    if (opts.expectedStatus) {
      conditions.push(eq(leads.status, opts.expectedStatus));
    }

    const [updated] = await tx
      .update(leads)
      .set({ status: opts.toStatus, updatedAt: new Date() })
      .where(and(...conditions))
      .returning();

    if (!updated) {
      const [existing] = await tx
        .select({ id: leads.id })
        .from(leads)
        .where(and(eq(leads.id, leadId), scopeCondition(opts.demo)));
      return { ok: false, reason: existing ? "conflict" : "not_found" } as const;
    }

    await tx.insert(leadStatusHistory).values({
      leadId,
      fromStatus: opts.expectedStatus ?? null,
      toStatus: opts.toStatus,
      changedBy: opts.changedBy ?? null,
      note: opts.note,
    });

    return { ok: true, lead: updated } as const;
  });
}

export async function getLeadHistory(leadId: string) {
  const db = getDb();
  return db
    .select()
    .from(leadStatusHistory)
    .where(eq(leadStatusHistory.leadId, leadId))
    .orderBy(desc(leadStatusHistory.changedAt));
}

export async function getLeadStats(demo: boolean) {
  const db = getDb();
  const where = and(scopeCondition(demo), eq(leads.isSpam, false));

  const [totals] = await db
    .select({
      total: count(),
      newCount: count(sql`case when ${leads.status} = 'new' then 1 end`),
      contactedCount: count(
        sql`case when ${leads.status} = 'contacted' then 1 end`,
      ),
      closedCount: count(sql`case when ${leads.status} = 'closed' then 1 end`),
      avgScore: sql<number>`coalesce(avg(${leads.score}), 0)`,
    })
    .from(leads)
    .where(where);

  const timeSeries = await db
    .select({
      day: sql<string>`date_trunc('day', ${leads.createdAt})::date`,
      count: count(),
    })
    .from(leads)
    .where(where)
    .groupBy(sql`date_trunc('day', ${leads.createdAt})`)
    .orderBy(sql`date_trunc('day', ${leads.createdAt})`);

  const [spam] = await db
    .select({ total: count() })
    .from(leads)
    .where(and(scopeCondition(demo), eq(leads.isSpam, true)));

  return {
    total: Number(totals?.total ?? 0),
    new: Number(totals?.newCount ?? 0),
    contacted: Number(totals?.contactedCount ?? 0),
    closed: Number(totals?.closedCount ?? 0),
    avgScore: Math.round(Number(totals?.avgScore ?? 0)),
    spam: Number(spam?.total ?? 0),
    timeSeries: timeSeries.map((r) => ({ day: r.day, count: Number(r.count) })),
  };
}

export async function deleteDemoLeads() {
  const db = getDb();
  await db.delete(leads).where(scopeCondition(true));
}
