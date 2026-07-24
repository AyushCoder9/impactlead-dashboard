import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

// neon-http is stateless-per-request and does NOT support multi-statement
// transactions (confirmed the hard way: updateLeadStatus needs one for the
// atomic status+history write). neon-serverless (WebSocket, pooled) does
// support them, so that's what we use everywhere for consistency rather
// than mixing two drivers.
neonConfig.webSocketConstructor = ws;

const fullSchema = { ...schema, ...authSchema };

type Schema = typeof fullSchema;

// Lazy singleton: never call Pool()/drizzle() at module top level, and never
// wrap this in a Proxy — both break either `next build` (before env vars
// exist) or better-auth's Drizzle adapter (silent hang, no thrown error).
let dbInstance: NeonDatabase<Schema> | undefined;

export function getDb(): NeonDatabase<Schema> {
  if (!dbInstance) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    const pool = new Pool({ connectionString: url });
    dbInstance = drizzle(pool, { schema: fullSchema });
  }
  return dbInstance;
}
