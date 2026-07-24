import { createHash } from "node:crypto";

/**
 * One-way hash for IP storage — we never persist raw IPs (privacy), but a
 * stable hash still lets us reason about rate limiting / abuse patterns
 * after the fact. Salted with an env secret so hashes aren't reversible via
 * a simple rainbow table of the IPv4 space.
 */
export function hashIp(ip: string): string {
  const salt = process.env.BETTER_AUTH_SECRET ?? "leaddesk-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }
  return headers.get("x-real-ip") ?? "0.0.0.0";
}
