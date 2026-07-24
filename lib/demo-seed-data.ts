import type { NewLead } from "@/lib/db/schema";
import { scoreLead } from "@/lib/spam/score";

// Synthetic demo leads only — clearly fictional, never presented as real
// customer data anywhere in the UI. Used to seed the public, no-login
// /demo sandbox.
const RAW_DEMO_LEADS: Array<
  Pick<NewLead, "name" | "email" | "budgetRange" | "message" | "status">
> = [
  {
    name: "Priya Nair",
    email: "priya@northwind-labs.example",
    budgetRange: "15k_50k",
    message:
      "We're rebuilding our internal ops dashboard and need a partner who can own both the data model and the frontend. Timeline is roughly 6 weeks.",
    status: "new",
  },
  {
    name: "Marcus Webb",
    email: "marcus.webb@fernbridge.example",
    budgetRange: "50k_plus",
    message:
      "Looking for a full product build — auth, billing, admin panel — for a B2B SaaS launching next quarter. Can share a spec doc on a call.",
    status: "contacted",
  },
  {
    name: "Elena Torres",
    email: "elena@torres-studio.example",
    budgetRange: "under_5k",
    message: "Small agency site refresh, mostly copy and a new contact form.",
    status: "closed",
  },
  {
    name: "Daniel Kim",
    email: "dan@kimventures.example",
    budgetRange: "5k_15k",
    message:
      "Need a lead capture flow similar to this one, actually — landing page plus an admin view for our sales team.",
    status: "new",
  },
  {
    name: "Aisha Bello",
    email: "aisha.bello@harborfreight-co.example",
    budgetRange: "15k_50k",
    message:
      "Migrating off a legacy CRM. Want something we fully own the data for, deployed on our own infrastructure.",
    status: "contacted",
  },
  {
    name: "Tom Reilly",
    email: "tom@reilly-consulting.example",
    budgetRange: "under_5k",
    message: "Just exploring options right now, not ready to commit to scope yet.",
    status: "new",
  },
  {
    name: "Sofia Marchetti",
    email: "sofia@marchetti-design.example",
    budgetRange: "50k_plus",
    message:
      "Multi-tenant platform for our design agency's clients, white-labeled per client. Happy to discuss architecture in detail.",
    status: "closed",
  },
  {
    name: "Ben Okafor",
    email: "ben@okafor-analytics.example",
    budgetRange: "15k_50k",
    message:
      "Analytics dashboard with real-time charts and CSV export for our internal team of 12.",
    status: "new",
  },
];

export function buildDemoLeads(): NewLead[] {
  return RAW_DEMO_LEADS.map((lead, i) => {
    const score = scoreLead({
      budgetRange: lead.budgetRange,
      message: lead.message,
      email: lead.email,
    });
    const daysAgo = i * 2 + 1;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return {
      ...lead,
      score,
      isDemo: true,
      isSpam: false,
      createdAt,
      updatedAt: createdAt,
    };
  });
}
