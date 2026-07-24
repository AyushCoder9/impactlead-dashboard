import { z } from "zod";

export const BUDGET_RANGES = [
  "under_5k",
  "5k_15k",
  "15k_50k",
  "50k_plus",
] as const;

export const BUDGET_RANGE_LABELS: Record<(typeof BUDGET_RANGES)[number], string> = {
  under_5k: "Under $5k",
  "5k_15k": "$5k – $15k",
  "15k_50k": "$15k – $50k",
  "50k_plus": "$50k+",
};

// Free-tier disposable email domains worth a soft warning (not a hard
// block — a false positive here loses a real lead, which is worse than
// letting a handful of throwaway addresses through).
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "tempmail.com",
  "yopmail.com",
  "trashmail.com",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}

export const leadFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(254),
  budgetRange: z.enum(BUDGET_RANGES, {
    message: "Select a budget range",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a bit more (at least 10 characters)")
    .max(2000, "Message is too long (max 2000 characters)"),
  // Honeypot: real users never see or fill this field. Any value here means
  // it was filled by a bot/script, not a validation error to show a human.
  company: z.string().max(0).optional().or(z.literal("")),
  // Timestamp (ms) the form was rendered, used for a minimum-fill-time bot
  // heuristic — set client-side, re-checked server-side.
  renderedAt: z.number().optional(),
  turnstileToken: z.string().optional(),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;
