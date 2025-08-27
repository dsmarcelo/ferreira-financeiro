import { createTable } from "./table-creator";
import { integer, decimal, serial } from "drizzle-orm/pg-core";
import { incomes } from "./incomes-schema";
import { products } from "./products";

// Optional linkage of products sold within an income (sale)
export const incomeItem = createTable("income_item", {
  id: serial("id").primaryKey(),
  incomeId: integer("income_id").references(() => incomes.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
});

export type IncomeItem = typeof incomeItem.$inferSelect;
export type IncomeItemInsert = typeof incomeItem.$inferInsert;


