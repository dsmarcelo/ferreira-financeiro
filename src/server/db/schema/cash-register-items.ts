import { createTable } from "./table-creator";
import { integer, decimal, serial } from "drizzle-orm/pg-core";
import { cashRegister } from "./cash-register-schema";
import { products } from "./products-schema";

/**
 * Line items for cash register entries: product, quantity, and unitPrice at sale time.
 */
export const cashRegisterItem = createTable("cash_register_item", {
  id: serial("id").primaryKey(),
  cashRegisterId: integer("cash_register_id").references(() => cashRegister.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  // Allow decimal quantities
  quantity: decimal("quantity", { precision: 15, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
});

export type CashRegisterItem = typeof cashRegisterItem.$inferSelect;
export type CashRegisterItemInsert = typeof cashRegisterItem.$inferInsert;

