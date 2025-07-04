import { createTable } from "./table-creator";
import { text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const expenseCategory = createTable("expense_category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("blue"),
  emoji: text("emoji").notNull().default("💸"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const DEFAULT_CATEGORY: ExpenseCategory = {
  id: 1,
  name: "Diversos",
  description: "Categoria padrão para despesas",
  color: "blue",
  emoji: "💸",
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: null,
};

export type ExpenseCategory = typeof expenseCategory.$inferSelect;
export type ExpenseCategoryInsert = typeof expenseCategory.$inferInsert;
