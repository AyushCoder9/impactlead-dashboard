import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { getDb } from "../lib/db";
import { user } from "../lib/db/auth-schema";
import { leads } from "../lib/db/schema";
import * as authSchema from "../lib/db/auth-schema";
import { buildDemoLeads } from "../lib/demo-seed-data";

async function main() {
  const db = getDb();

  // --- Admin user (idempotent: upsert-on-email, safe to re-run) ---
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "[seed] SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin user seed.",
    );
  } else {
    const existing = await db.select().from(user).where(eq(user.email, email));
    if (existing.length > 0) {
      console.log(`[seed] Admin user ${email} already exists, skipping.`);
    } else {
      // Signup is disabled on the real app instance (lib/auth.ts). Use a
      // one-off local instance with signup enabled, pointed at the same DB,
      // purely so better-auth's own password hashing produces a user/account
      // row the real app can log in against later.
      const seedAuth = betterAuth({
        database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
        secret: process.env.BETTER_AUTH_SECRET,
        emailAndPassword: { enabled: true },
      });

      await seedAuth.api.signUpEmail({
        body: { name: "LeadDesk Admin", email, password },
      });
      console.log(`[seed] Created admin user ${email}`);
    }
  }

  // --- Demo leads (idempotent: clear + reseed) ---
  await db.delete(leads).where(eq(leads.isDemo, true));
  await db.insert(leads).values(buildDemoLeads());
  console.log("[seed] Reseeded demo leads.");
}

main()
  .then(() => {
    console.log("[seed] Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exit(1);
  });
