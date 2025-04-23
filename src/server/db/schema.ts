// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  pgTableCreator,
  uuid,
  decimal,
  date,
  timestamp,
  text,
  boolean,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `prime-financeiro_${name}`);

/**
 * Represents daily cash register entries.
 */
export const cashRegister = createTable("cash_register", (d) => ({
  // Unique identifier for the cash register entry (UUID v4)
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  // The monetary value recorded in the cash register - Using decimal(15,2) for money values
  // 15 digits total with 2 decimal places allows for values up to 999,999,999,999.99
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  // The date the cash register entry was made
  date: date("date").notNull(),
  // Timestamp when the record was created
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  // Timestamp when the record was last updated
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
}));

/**
 * Represents personal expenses.
 */
export const personalExpense = createTable("personal_expense", {
  // Unique identifier for the personal expense (UUID v4)
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  // The monetary value of the expense - Using decimal(15,2) for money values
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  // A description of the expense
  description: text("description").notNull(),
  // The date the expense occurred
  date: date("date").notNull(),
  // Indicates whether the expense has been paid
  isPaid: boolean("is_paid").default(false).notNull(),
  // Timestamp when the record was created
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  // Timestamp when the record was last updated
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

/**
 * Represents store-related expenses.
 */
export const storeExpense = createTable("store_expense", {
  // Unique identifier for the store expense (UUID v4)
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  // The monetary value of the expense - Using decimal(15,2) for money values
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  // A description of the expense
  description: text("description").notNull(),
  // The date the expense occurred or was recorded
  date: date("date").notNull(),
  // The due date for the expense (e.g., invoice due date), can be null
  dueDate: date("due_date"),
  // Indicates whether the expense has been paid
  isPaid: boolean("is_paid").default(false).notNull(),
  // Timestamp when the record was created
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  // Timestamp when the record was last updated
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

/**
 * Represents expenses related to product inventory (entries and exits).
 */
export const productPurchase = createTable("product_purchase", {
  // Unique identifier for the product transaction (UUID v4)
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  // The monetary value of the expense - Using decimal(15,2) for money values
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  // Name or description of the product
  description: text("description").notNull(),
  // The date the transaction occurred
  date: date("date").notNull(),
  // Indicates whether the expense has been paid
  isPaid: boolean("is_paid").default(false).notNull(),
  // Timestamp when the record was created
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  // Timestamp when the record was last updated
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export type CashRegister = typeof cashRegister.$inferSelect;
export type PersonalExpense = typeof personalExpense.$inferSelect;
export type StoreExpense = typeof storeExpense.$inferSelect;
export type ProductPurchase = typeof productPurchase.$inferSelect;

export type CashRegisterInsert = typeof cashRegister.$inferInsert;
export type PersonalExpenseInsert = typeof personalExpense.$inferInsert;
export type StoreExpenseInsert = typeof storeExpense.$inferInsert;
export type ProductPurchaseInsert = typeof productPurchase.$inferInsert;
