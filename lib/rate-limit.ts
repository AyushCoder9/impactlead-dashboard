import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | undefined;

function getRedis(): Redis | undefined {
  // Vercel's Upstash-via-Marketplace integration names these KV_REST_API_*
  // rather than the "vanilla" Upstash UPSTASH_REDIS_REST_* names — support
  // both so this works whichever way Redis got provisioned.
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return undefined; // rate limiting degrades gracefully — see checkLeadRateLimit
  }
  if (!redis) {
    redis = new Redis({ url, token });
  }
  return redis;
}

let leadLimiter: Ratelimit | undefined;

/**
 * 5 submissions per 10 minutes, keyed by IP+email combo (never IP alone —
 * a shared office/NAT IP shouldn't lock out unrelated legitimate leads).
 * If Upstash env vars are absent (e.g. a fresh clone with no keys set yet),
 * this returns `null` and the caller skips the check rather than crashing —
 * honeypot + timing heuristics still apply either way.
 */
export async function checkLeadRateLimit(
  key: string,
): Promise<{ success: boolean } | null> {
  const client = getRedis();
  if (!client) return null;

  if (!leadLimiter) {
    leadLimiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "leaddesk:lead-submit",
    });
  }
  const result = await leadLimiter.limit(key);
  return { success: result.success };
}
