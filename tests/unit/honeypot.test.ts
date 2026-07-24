import { describe, expect, it } from "vitest";
import { looksLikeBot } from "@/lib/spam/honeypot";

describe("looksLikeBot", () => {
  it("flags a filled honeypot field", () => {
    expect(looksLikeBot({ company: "Acme Bot Co" })).toBe(true);
  });

  it("flags a submission that was rendered and submitted too fast", () => {
    expect(looksLikeBot({ renderedAt: Date.now() - 100 })).toBe(true);
  });

  it("allows a normal human-paced submission", () => {
    expect(looksLikeBot({ company: "", renderedAt: Date.now() - 5000 })).toBe(
      false,
    );
  });

  it("allows a submission with no timing info and empty honeypot", () => {
    expect(looksLikeBot({ company: "" })).toBe(false);
  });
});
