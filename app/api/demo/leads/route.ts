import { NextResponse, type NextRequest } from "next/server";
import { getDemoLeads } from "@/lib/db/queries/leads";

// Public, no-login endpoint — deliberately scoped to is_demo=true only via
// getDemoLeads(). See CLAUDE.md "Demo isolation is structural".
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? undefined;
  const status = url.searchParams.get("status") as
    | "new"
    | "contacted"
    | "closed"
    | null;
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "10");

  const result = await getDemoLeads({
    search,
    status: status ?? undefined,
    page,
    pageSize,
  });

  return NextResponse.json(result);
}
