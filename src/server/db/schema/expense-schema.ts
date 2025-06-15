import { sql } from "drizzle-orm";
import { createTable } from "./table-creator";
import { expenseCategory } from "./expense-category";

import {
  boolean,
  date,
  decimal,
  integer,
  pgEnum,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Expense type: one_time, installment, recurring

export const expenseTypeEnum = pgEnum("expense_type", [
  "one_time",
  "installment",
  "recurring",
  "recurring_occurrence",
]);

// Expense source: personal, store, product_purchase

export const expenseSourceEnum = pgEnum("expense_source", [
  "personal",
  "store",
  "product_purchase",
]);

// Recurrence type: monthly, weekly, yearly
export const recurrenceTypeEnum = pgEnum("recurrence_type", [
  "weekly",
  "monthly",
  "yearly",
  "custom_days",
]);

// Unified expense table
export const expense = createTable("expense", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  date: date("date").notNull(),
  type: expenseTypeEnum("type").notNull(),
  source: expenseSourceEnum("source").notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  categoryId: integer("category_id").references(() => expenseCategory.id),
  installmentNumber: integer("installment_number"),
  totalInstallments: integer("total_installments"),
  groupId: uuid("group_id"), // To link expenses of the same purchase (now UUID)
  recurrenceType: recurrenceTypeEnum("recurrence_type"), // weekly, monthly, yearly, custom_days
  recurrenceInterval: integer("recurrence_interval"), // Number of days between repetitions if custom_days, otherwise null
  recurrenceEndDate: date("recurrence_end_date"), // Optional end date for recurrence
  originalRecurringExpenseId: integer("original_recurring_expense_id").$type<number | null>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export type Expense = typeof expense.$inferSelect;
export type ExpenseInsert = typeof expense.$inferInsert;
export type ExpenseType = typeof expenseTypeEnum;
export type ExpenseSource = (typeof expenseSourceEnum.enumValues)[number];
