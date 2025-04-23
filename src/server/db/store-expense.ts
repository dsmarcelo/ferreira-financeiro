import { sql } from "drizzle-orm";
import { createTable } from "./schema";
import {
  uuid,
  decimal,
  date,
  timestamp,
  text,
  boolean,
} from "drizzle-orm/pg-core";

/**
 * Represents store-related expenses.
 */
export const storeExpense = createTable("store_expense", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  dueDate: date("due_date"),
  isPaid: boolean("is_paid").default(false).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export type StoreExpense = typeof storeExpense.$inferSelect;
export type StoreExpenseInsert = typeof storeExpense.$inferInsert;
