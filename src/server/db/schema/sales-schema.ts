import { sql } from "drizzle-orm";
import { createTable } from "./table-creator";
import { serial, decimal, timestamp, text, integer } from "drizzle-orm/pg-core";
import { customers } from "./customers";

/**
 * Represents sales with optional discounts and customer linkage.
 */
export const sales = createTable("sales", {
  id: serial("id").primaryKey(),
  dateTime: timestamp("date_time", { withTimezone: true }).notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
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

export type Sale = typeof sales.$inferSelect;
export type SaleInsert = typeof sales.$inferInsert;

