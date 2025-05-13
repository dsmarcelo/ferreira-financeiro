import { createTable } from "./table-creator";
import { recurringExpense } from "./recurring-expense";
import {
  serial,
  numeric,
  date,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

/**
 * Each row represents a single occurrence of a recurring expense (e.g., Netflix for May 2025).
 * Value is fixed for each occurrence and does not change if the template changes.
 */
export const recurringExpenseOccurrence = createTable("recurring_expense_occurrence", {
  id: serial("id").primaryKey(),
  recurringExpenseId: integer("recurring_expense_id").notNull().references(() => recurringExpense.id),
  dueDate: date("due_date").notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RecurringExpenseOccurrence = typeof recurringExpenseOccurrence.$inferSelect;
export type RecurringExpenseOccurrenceInsert = typeof recurringExpenseOccurrence.$inferInsert;
