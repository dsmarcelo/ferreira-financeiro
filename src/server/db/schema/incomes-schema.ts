import { sql } from "drizzle-orm";
import { createTable } from "./table-creator";
import { serial, decimal, timestamp, text, integer } from "drizzle-orm/pg-core";
import { customers } from "./customers";

/**
 * Represents daily income entries with profit margins.
 */
export const incomes = createTable("incomes", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  profitMargin: decimal("profit_margin", { precision: 15, scale: 2 }).notNull(),
  dateTime: timestamp("date_time", { withTimezone: true }).notNull(),
  // Optional sale enrichment fields
  discountType: text("discount_type"), // 'percent' | 'fixed'
  discountValue: decimal("discount_value", { precision: 15, scale: 2 }),
  customerId: integer("customer_id").references(() => customers.id),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export type Income = typeof incomes.$inferSelect;
export type IncomeInsert = typeof incomes.$inferInsert;
