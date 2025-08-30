import { sql } from "drizzle-orm";
import { createTable } from "./table-creator";
import { serial, decimal, timestamp, text, integer } from "drizzle-orm/pg-core";
import { customers } from "./customers";

/**
 * Represents sales with optional discounts and customer linkage.
 */
export const sales = createTable("sales", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  dateTime: timestamp("date_time", { withTimezone: true }).notNull(),
  discountType: text("discount_type"), // 'percent' | 'fixed'
  discountValue: decimal("discount_value", { precision: 15, scale: 2 }),
  customerId: integer("customer_id").references(() => customers.id),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export interface Sale {
  id: number;
  description: string;
  value: string;
  dateTime: Date;
  discountType?: string | null;
  discountValue?: string | null;
  customerId: number | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export type SaleInsert = Omit<Sale, "id" | "createdAt" | "updatedAt">;

