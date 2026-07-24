import { NextResponse, type NextRequest } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { leadFormSchema } from "@/lib/validation/lead";
import { looksLikeBot } from "@/lib/spam/honeypot";
import { scoreLead } from "@/lib/spam/score";
import { checkLeadRateLimit } from "@/lib/rate-limit";
import { hashIp, getClientIp } from "@/lib/utils/hash-ip";
import { getRealLeads, insertLead } from "@/lib/db/queries/leads";
import { notifyNewLead } from "@/lib/email";

async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Progressive enhancement: if Turnstile isn't configured (e.g. a fresh
  // clone with no keys yet), don't block submissions on it.
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
      },
    );
    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch {
    return true; // don't hard-fail real users on a Cloudflare outage
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = leadFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const data = parsed.data;

  // Bot defense: honeypot + timing, then Turnstile, then rate limit — cheap
  // checks first so we never pay for a Turnstile round-trip on obvious bots.
  if (looksLikeBot({ company: data.company, renderedAt: data.renderedAt })) {
    // Return a fake-success response so the bot doesn't learn it was caught.
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const turnstileOk = await verifyTurnstile(data.turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const ip = getClientIp(request.headers);
  const rateLimitKey = `${ip}:${data.email}`;
  const rateLimit = await checkLeadRateLimit(rateLimitKey);
  if (rateLimit && !rateLimit.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  const score = scoreLead({
    budgetRange: data.budgetRange,
    message: data.message,
    email: data.email,
  });

  const lead = await insertLead(
    {
      name: data.name,
      email: data.email,
      budgetRange: data.budgetRange,
      message: data.message,
      score,
      ipHash: hashIp(ip),
      userAgent: request.headers.get("user-agent"),
    },
    { demo: false },
  );

  after(() => notifyNewLead(lead));

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? undefined;
  const status = url.searchParams.get("status") as
    | "new"
    | "contacted"
    | "closed"
    | null;
  const includeSpam = url.searchParams.get("includeSpam") === "true";
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "25");

  const result = await getRealLeads({
    search,
    status: status ?? undefined,
    includeSpam,
    page,
    pageSize,
  });

  return NextResponse.json(result);
}
