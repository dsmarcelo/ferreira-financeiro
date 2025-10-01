import { sql } from "drizzle-orm";
import { createTable } from "./table-creator";
import { serial, text, decimal, timestamp } from "drizzle-orm/pg-core";

/**
 * Products kept in stock for sales.
 */
export const products = createTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cost: decimal("cost", { precision: 15, scale: 2 }).notNull(),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  quantity: decimal("quantity").notNull().default("0"),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export type Product = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;


