import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getRealLeads } from "@/lib/db/queries/leads";
import { BUDGET_RANGE_LABELS } from "@/lib/validation/lead";

// Prevent CSV formula injection: a cell starting with = + - @ can execute as
// a formula when the export is opened in Excel/Sheets. Prefix with a tab
// character (invisible, keeps the value readable) to neutralize it.
function csvSafe(value: string): string {
  const needsGuard = /^[=+\-@]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return `"${needsGuard ? "\t" : ""}${escaped}"`;
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await getRealLeads({ pageSize: 10000, includeSpam: false });

  const header = [
    "Name",
    "Email",
    "Budget",
    "Status",
    "Score",
    "Message",
    "Created At",
  ];
  const lines = [header.map(csvSafe).join(",")];
  for (const lead of rows) {
    lines.push(
      [
        lead.name,
        lead.email,
        BUDGET_RANGE_LABELS[lead.budgetRange as keyof typeof BUDGET_RANGE_LABELS] ??
          lead.budgetRange,
        lead.status,
        String(lead.score),
        lead.message,
        lead.createdAt.toISOString(),
      ]
        .map(csvSafe)
        .join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leaddesk-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
