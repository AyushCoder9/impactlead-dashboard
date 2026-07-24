import { Resend } from "resend";
import type { Lead } from "@/lib/db/schema";
import { BUDGET_RANGE_LABELS } from "@/lib/validation/lead";

let resend: Resend | undefined;

function getResend(): Resend | undefined {
  if (!process.env.RESEND_API_KEY) return undefined;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

/**
 * Fired via Next.js `after()` so a Resend outage never fails the public
 * submission — the lead is already committed to the database by the time
 * this runs. Errors are swallowed (logged) on purpose, never re-thrown.
 */
export async function notifyNewLead(lead: Lead): Promise<void> {
  const client = getResend();
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!client || !to) return;

  try {
    await client.emails.send({
      from: "LeadDesk <onboarding@resend.dev>",
      to,
      subject: `New lead: ${lead.name} (${BUDGET_RANGE_LABELS[lead.budgetRange as keyof typeof BUDGET_RANGE_LABELS] ?? lead.budgetRange})`,
      text: [
        `Name: ${lead.name}`,
        `Email: ${lead.email}`,
        `Budget: ${lead.budgetRange}`,
        `Score: ${lead.score}/100`,
        "",
        lead.message,
      ].join("\n"),
    });
  } catch (error) {
    console.error("[email] failed to send new-lead notification", error);
  }
}
