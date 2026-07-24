import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

export const budgetRangeEnum = pgEnum("budget_range", [
  "under_5k",
  "5k_15k",
  "15k_50k",
  "50k_plus",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "closed",
]);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    budgetRange: budgetRangeEnum("budget_range").notNull(),
    message: text("message").notNull(),
    status: leadStatusEnum("status").notNull().default("new"),
    source: text("source"),
    score: integer("score").notNull().default(0),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    isSpam: boolean("is_spam").notNull().default(false),
    duplicateOfLeadId: uuid("duplicate_of_lead_id"),
    isDemo: boolean("is_demo").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("leads_email_idx").on(table.email),
    index("leads_status_idx").on(table.status),
    index("leads_created_at_idx").on(table.createdAt),
    index("leads_is_spam_idx").on(table.isSpam),
    index("leads_is_demo_idx").on(table.isDemo),
  ],
);

export const leadStatusHistory = pgTable(
  "lead_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    fromStatus: leadStatusEnum("from_status"),
    toStatus: leadStatusEnum("to_status").notNull(),
    changedBy: text("changed_by").references(() => user.id, {
      onDelete: "set null",
    }),
    changedAt: timestamp("changed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    note: text("note"),
  },
  (table) => [index("lead_status_history_lead_id_idx").on(table.leadId)],
);

export const leadsRelations = relations(leads, ({ many }) => ({
  history: many(leadStatusHistory),
}));

export const leadStatusHistoryRelations = relations(
  leadStatusHistory,
  ({ one }) => ({
    lead: one(leads, {
      fields: [leadStatusHistory.leadId],
      references: [leads.id],
    }),
  }),
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type LeadStatusHistoryEntry = typeof leadStatusHistory.$inferSelect;
