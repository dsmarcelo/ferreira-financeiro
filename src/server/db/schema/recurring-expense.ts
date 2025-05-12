import { createTable } from "./table-creator";
import {
  serial,
  numeric,
  text,
  date,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Stores recurring expense templates (subscriptions, monthly bills, etc).
 * Each instance is generated from this template and stored in the appropriate expense/installment table.
 */
export const recurringExpense = createTable("recurring_expense", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  recurrenceType: text("recurrence_type").notNull(), // e.g. 'monthly', 'weekly', 'yearly'
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // nullable for indefinite recurrence
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RecurringExpense = typeof recurringExpense.$inferSelect;
export type RecurringExpenseInsert = typeof recurringExpense.$inferInsert;
