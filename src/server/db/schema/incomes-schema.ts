import { sql } from "drizzle-orm";
import { createTable } from "./table-creator";
import { serial, decimal, timestamp, text } from "drizzle-orm/pg-core";

/**
 * Represents daily income entries with profit margins.
 */
export const incomes = createTable("incomes", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  profitMargin: decimal("profit_margin", { precision: 15, scale: 2 }).notNull(),
  dateTime: timestamp("date_time", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export type Income = typeof incomes.$inferSelect;
export type IncomeInsert = typeof incomes.$inferInsert;
