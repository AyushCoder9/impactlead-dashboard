// Same-email resubmission window. Actual DB lookup lives in
// lib/db/queries/leads.ts (the only file allowed to query `leads` directly —
// see CLAUDE.md); this just centralizes the policy constant.
export const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
