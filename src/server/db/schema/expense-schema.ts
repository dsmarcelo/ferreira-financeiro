import { relations, sql } from "drizzle-orm";

import { createTable } from "./table-creator";

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
]);

// Expense source: personal, store, product_purchase

export const expenseSourceEnum = pgEnum("expense_source", [
  "personal",
  "store",
  "product_purchase",
]);

// Recurrence type: monthly, weekly, yearly
export const recurrenceTypeEnum = pgEnum("recurrence_type", [
  "monthly",
  "weekly",
  "yearly",
]);

// Recurrence rule table
export const recurrenceRule = createTable("recurrence_rule", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: recurrenceTypeEnum("type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  value: decimal("value", { precision: 15, scale: 2 }),
  description: text("description"),
});

// Unified expense table
export const expense = createTable("expense", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  date: date("date").notNull(),
  type: expenseTypeEnum("type").notNull(),
  source: expenseSourceEnum("source").notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  recurrenceRuleId: uuid("recurrence_rule_id").references(
    () => recurrenceRule.id,
  ),
  installmentNumber: integer("installment_number"),
  totalInstallments: integer("total_installments"),
  installmentId: uuid("installment_id"), // To link installments of the same purchase (now UUID)
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

// Expense → Parent (many-to-one, self-referencing)

export const expenseRelations = relations(expense, ({ one, many }) => ({
  children: many(expense, { relationName: "expense_parent" }),
  recurrenceRule: one(recurrenceRule, {
    fields: [expense.recurrenceRuleId],
    references: [recurrenceRule.id],
    relationName: "expense_recurrence_rule",
  }),
}));

// RecurrenceRule → Expenses (one-to-many)

export const recurrenceRuleRelations = relations(
  recurrenceRule,
  ({ many }) => ({
    expenses: many(expense, { relationName: "expense_recurrence_rule" }),
  }),
);

export type Expense = typeof expense.$inferSelect;
export type ExpenseInsert = typeof expense.$inferInsert;
export type RecurrenceRule = typeof recurrenceRule.$inferSelect;
export type RecurrenceRuleInsert = typeof recurrenceRule.$inferInsert;
export type ExpenseType = typeof expenseTypeEnum;
export type ExpenseSource = (typeof expenseSourceEnum.enumValues)[number];
export type RecurrenceType = (typeof recurrenceTypeEnum.enumValues)[number];
