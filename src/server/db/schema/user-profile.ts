import { sql } from "drizzle-orm";
import { createTable } from "./table-creator";
import { uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

/**
 * User profiles table that extends Supabase auth.users
 * This table stores additional user information beyond what Supabase auth provides
 */
export const profiles = createTable("profiles", {
  // Primary key that references auth.users(id)
  id: uuid("id").primaryKey(),

  // User display information
  fullName: text("full_name"),
  displayName: text("display_name"),

  // Contact information
  email: text("email").notNull(),

  // Profile settings
  isActive: boolean("is_active").default(true).notNull(),

  // Role-based access control
  role: text("role", { enum: ["admin", "user"] }).default("user").notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

/**
 * User sessions table for tracking active sessions
 * This is optional and can be used for advanced session management
 */
export const userSessions = createTable("user_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),

  // Session metadata
  deviceInfo: text("device_info"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),

  // Session timing
  lastActivity: timestamp("last_activity", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),

  // Status
  isActive: boolean("is_active").default(true).notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

// Type exports for TypeScript
export type Profile = typeof profiles.$inferSelect;
export type ProfileInsert = typeof profiles.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type UserSessionInsert = typeof userSessions.$inferInsert;
