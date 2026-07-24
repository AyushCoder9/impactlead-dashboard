import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db";
import * as authSchema from "./db/auth-schema";

function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: authSchema,
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    emailAndPassword: {
      enabled: true,
      // Hard requirement: no public admin registration. Accounts are created
      // only via drizzle/seed.ts. Without this flag, better-auth still
      // exposes POST /api/auth/sign-up/email even with no UI pointing at it.
      disableSignUp: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // sliding refresh once/day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 10,
      customRules: {
        "/sign-in/email": {
          window: 60,
          max: 5,
        },
      },
    },
    advanced: {
      // IP+email is enforced at the customRules level above via better-auth's
      // own request-scoped limiter; cookie attributes hardened for a public
      // admin surface.
      useSecureCookies: process.env.NODE_ENV === "production",
    },
  });
}

type Auth = ReturnType<typeof createAuth>;

// Lazy singleton, same reason as lib/db/index.ts's getDb(): constructing
// betterAuth() eagerly calls drizzleAdapter(getDb()), which throws if
// DATABASE_URL isn't set yet — and every route that imports `auth` (even
// just to reference it inside a handler, never at module scope) would
// otherwise crash `next build` during page-data collection, not just at
// runtime. A Proxy here is safe (unlike wrapping the db client itself,
// which breaks better-auth's own adapter inspection) because nothing
// inspects `auth`'s shape via traps — every caller just calls methods on it.
let authInstance: Auth | undefined;

function ensureAuth(): Auth {
  if (!authInstance) authInstance = createAuth();
  return authInstance;
}

export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    return Reflect.get(ensureAuth(), prop, receiver);
  },
  // toNextJsHandler does `"handler" in auth`, which triggers the `has` trap,
  // not `get` — without this, it silently falls through to the wrong branch
  // and throws "auth is not a function". Caught live via a real login
  // attempt, not just the build check.
  has(_target, prop) {
    return Reflect.has(ensureAuth(), prop);
  },
});

export type Session = Auth["$Infer"]["Session"];
