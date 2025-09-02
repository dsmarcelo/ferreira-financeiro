import { createTable } from "./table-creator";
import { integer, decimal, serial } from "drizzle-orm/pg-core";
import { incomes } from "./incomes-schema";
import { sales } from "./sales-schema";
import { products } from "./products-schema";

// Optional linkage of products sold within an income (sale)
export const incomeItem = createTable("income_item", {
  id: serial("id").primaryKey(),
  // Link to an income record (legacy) or to a sale
  incomeId: integer("income_id").references(() => incomes.id, { onDelete: "cascade" }),
  salesId: integer("sales_id").references(() => sales.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
});

export type IncomeItem = typeof incomeItem.$inferSelect;
export type IncomeItemInsert = typeof incomeItem.$inferInsert;

