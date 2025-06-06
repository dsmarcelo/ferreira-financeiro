import { relations } from "drizzle-orm";
import { schema } from ".";

const { profiles, userSessions, expense, cashRegister } = schema;

/**
 * Define relationships between tables for Drizzle ORM
 * This enables proper joins and type-safe queries
 */

// Profile relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  expenses: many(expense),
  cashRegisterEntries: many(cashRegister),
  sessions: many(userSessions),
}));

// User sessions relations
export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(profiles, {
    fields: [userSessions.userId],
    references: [profiles.id],
  }),
}));
