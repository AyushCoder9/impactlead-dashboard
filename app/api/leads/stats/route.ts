import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getLeadStats } from "@/lib/db/queries/leads";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getLeadStats(false);
  return NextResponse.json(stats);
}
