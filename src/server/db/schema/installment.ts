import { createTable } from "./table-creator";
import {
  serial,
  decimal,
  date,
  timestamp,
  boolean,
  integer,
  text,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const installment = createTable("installments", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  number: integer("number").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export type Installment = typeof installment.$inferSelect;
export type InstallmentInsert = typeof installment.$inferInsert;
