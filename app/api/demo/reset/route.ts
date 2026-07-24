import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { buildDemoLeads } from "@/lib/demo-seed-data";

// Vercel Cron target — reseeds the /demo sandbox on a schedule so it never
// drifts too far from a clean state. Protected by CRON_SECRET so it can't
// be triggered by anyone who finds the URL.
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.delete(leads).where(eq(leads.isDemo, true));
    await tx.insert(leads).values(buildDemoLeads());
  });

  return NextResponse.json({ ok: true, resetAt: new Date().toISOString() });
}
