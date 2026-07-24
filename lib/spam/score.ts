import { isDisposableEmail } from "@/lib/validation/lead";

const BUDGET_WEIGHT: Record<string, number> = {
  under_5k: 10,
  "5k_15k": 30,
  "15k_50k": 60,
  "50k_plus": 90,
};

/**
 * Heuristic lead score (0-100). Not a machine-learning model — a
 * transparent, explainable weighting so an admin can see *why* a lead
 * scored the way it did:
 *   - budget tier (up to 45 pts, the strongest signal of deal size)
 *   - message quality: length + word variety (up to 40 pts)
 *   - email domain quality: business domain vs. free/disposable (up to 15 pts)
 */
export function scoreLead(input: {
  budgetRange: string;
  message: string;
  email: string;
}): number {
  const budgetScore = (BUDGET_WEIGHT[input.budgetRange] ?? 0) * 0.5;

  const words = input.message.trim().split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const lengthScore = Math.min(words.length / 40, 1) * 25;
  const varietyScore =
    words.length > 0 ? (uniqueWords.size / words.length) * 15 : 0;
  const messageScore = lengthScore + varietyScore;

  const domain = input.email.split("@")[1]?.toLowerCase() ?? "";
  const freeProviders = new Set([
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
  ]);
  let emailScore = 15;
  if (isDisposableEmail(input.email)) {
    emailScore = 0;
  } else if (freeProviders.has(domain)) {
    emailScore = 8;
  }

  const total = Math.round(budgetScore + messageScore + emailScore);
  return Math.max(0, Math.min(100, total));
}
