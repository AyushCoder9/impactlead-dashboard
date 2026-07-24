import { NextResponse } from "next/server";
import { getLeadStats } from "@/lib/db/queries/leads";

export async function GET() {
  const stats = await getLeadStats(true);
  return NextResponse.json(stats);
}
