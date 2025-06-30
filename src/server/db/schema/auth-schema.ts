import { sql } from "drizzle-orm"
import { createTable } from "./table-creator"
import {
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core"

/**
 * Auth.js Users table
 * Core user authentication data
 */
export const users = createTable("auth_users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password"), // Hashed password for credentials auth
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  // Additional fields for your app
  role: text("role", { enum: ["admin", "user"] }).default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
})

/**
 * Auth.js Accounts table
 * OAuth provider account linkages
 */
export const accounts = createTable("auth_accounts", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
}))

/**
 * Auth.js Sessions table
 * Active user sessions
 */
export const sessions = createTable("auth_sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
})

/**
 * Auth.js Verification tokens table
 * Email verification and password reset tokens
 */
export const verificationTokens = createTable("auth_verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}))

// Type exports for TypeScript
export type User = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert
export type Account = typeof accounts.$inferSelect
export type AccountInsert = typeof accounts.$inferInsert
export type Session = typeof sessions.$inferSelect
export type SessionInsert = typeof sessions.$inferInsert
export type VerificationToken = typeof verificationTokens.$inferSelect
export type VerificationTokenInsert = typeof verificationTokens.$inferInsert