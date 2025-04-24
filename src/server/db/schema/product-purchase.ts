import { sql } from "drizzle-orm";
import { createTable } from "./table-creator";
import {
  uuid,
  decimal,
  date,
  timestamp,
  text,
  boolean,
} from "drizzle-orm/pg-core";

/**
 * Represents expenses related to product inventory (entries and exits).
 */
export const productPurchase = createTable("product_purchase", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export type ProductPurchase = typeof productPurchase.$inferSelect;
export type ProductPurchaseInsert = typeof productPurchase.$inferInsert;
