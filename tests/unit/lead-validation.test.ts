import { describe, expect, it } from "vitest";
import { leadFormSchema, isDisposableEmail } from "@/lib/validation/lead";

describe("leadFormSchema", () => {
  const valid = {
    name: "Jordan Blake",
    email: "jordan@example.com",
    budgetRange: "5k_15k",
    message: "We'd like a rebuild of our marketing site within 6 weeks.",
  };

  it("accepts a valid submission", () => {
    const result = leadFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = leadFormSchema.safeParse({ ...valid, name: "a" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = leadFormSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid budget range enum value", () => {
    const result = leadFormSchema.safeParse({ ...valid, budgetRange: "unlimited" });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short message", () => {
    const result = leadFormSchema.safeParse({ ...valid, message: "hi" });
    expect(result.success).toBe(false);
  });

  it("rejects an oversized message", () => {
    const result = leadFormSchema.safeParse({
      ...valid,
      message: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-empty honeypot field", () => {
    const result = leadFormSchema.safeParse({ ...valid, company: "x" });
    expect(result.success).toBe(false);
  });

  it("lowercases and trims email", () => {
    const result = leadFormSchema.safeParse({
      ...valid,
      email: "  Jordan@Example.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("jordan@example.com");
    }
  });
});

describe("isDisposableEmail", () => {
  it("flags a known disposable domain", () => {
    expect(isDisposableEmail("someone@mailinator.com")).toBe(true);
  });

  it("does not flag a normal domain", () => {
    expect(isDisposableEmail("someone@example.com")).toBe(false);
  });
});
