import { describe, expect, it } from "vitest";
import { scoreLead } from "@/lib/spam/score";

describe("scoreLead", () => {
  it("scores a high-budget, detailed, business-email lead higher than a low-budget one-liner", () => {
    const strong = scoreLead({
      budgetRange: "50k_plus",
      message:
        "We are planning a full platform rebuild across web and mobile, with a dedicated team, over the next two quarters, and would like to discuss timeline and scope in detail on a call this week.",
      email: "founder@acme-corp.com",
    });
    const weak = scoreLead({
      budgetRange: "under_5k",
      message: "hi there interested",
      email: "someone@mailinator.com",
    });
    expect(strong).toBeGreaterThan(weak);
  });

  it("always returns a score within 0-100", () => {
    const score = scoreLead({
      budgetRange: "50k_plus",
      message: "word ".repeat(500),
      email: "test@example.com",
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("penalizes disposable email domains", () => {
    const withDisposable = scoreLead({
      budgetRange: "15k_50k",
      message: "Looking to build a dashboard for our internal team.",
      email: "test@mailinator.com",
    });
    const withReal = scoreLead({
      budgetRange: "15k_50k",
      message: "Looking to build a dashboard for our internal team.",
      email: "test@acme-corp.com",
    });
    expect(withDisposable).toBeLessThan(withReal);
  });
});
