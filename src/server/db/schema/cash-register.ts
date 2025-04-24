import { sql } from "drizzle-orm";
import { createTable } from "./table-creator";
import { uuid, decimal, date, timestamp } from "drizzle-orm/pg-core";

/**
 * Represents daily cash register entries.
 */
export const cashRegister = createTable("cash_register", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export type CashRegister = typeof cashRegister.$inferSelect;
export type CashRegisterInsert = typeof cashRegister.$inferInsert;
