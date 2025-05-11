import { sql } from "drizzle-orm";
import { createTable } from "./table-creator";
import {
  serial,
  decimal,
  date,
  timestamp,
  text,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Represents expenses related to product inventory (entries and exits).
 */
export const productPurchase = createTable("product_purchase", {
  id: serial("id").primaryKey(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  totalInstallments: serial("total_installments").notNull(),
  description: text("description").notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const productPurchaseInstallment = createTable(
  "product_purchase_installments",
  {
    id: serial("id").primaryKey(),
    // Foreign key linking to the bills table
    productPurchaseId: serial("product_purchase_id")
      .references(() => productPurchase.id, { onDelete: "cascade" })
      .notNull(),
    description: text("description").notNull(),
    installmentNumber: serial("installment_number").notNull(), // e.g., 1, 2, 3
    totalInstallments: serial("total_installments").notNull(),
    // Amount due for this specific installment
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    // Due date for this specific installment
    dueDate: date("due_date").notNull(),
    // Flag to track if this installment has been paid
    isPaid: boolean("is_paid").default(false).notNull(),
    // Timestamp when this installment was paid (nullable)
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
);

// ProductPurchase → Installments (one-to-many)
export const productPurchaseRelations = relations(
  productPurchase,
  ({ many }) => ({
    installments: many(productPurchaseInstallment),
  }),
);

// Installment → ProductPurchase (many-to-one)
export const productPurchaseInstallmentRelations = relations(
  productPurchaseInstallment,
  ({ one }) => ({
    productPurchase: one(productPurchase, {
      fields: [productPurchaseInstallment.productPurchaseId],
      references: [productPurchase.id],
    }),
  }),
);

export type ProductPurchase = typeof productPurchase.$inferSelect;
export type ProductPurchaseInsert = typeof productPurchase.$inferInsert;

export type ProductPurchaseInstallment =
  typeof productPurchaseInstallment.$inferSelect;

export type ProductPurchaseInstallmentInsert =
  typeof productPurchaseInstallment.$inferInsert;

export type ProductPurchaseWithInstallments =
  typeof productPurchase.$inferSelect & {
    installments: ProductPurchaseInstallment[];
  };

export type ProductPurchaseInstallmentWithProductPurchase =
  typeof productPurchaseInstallment.$inferSelect & {
    productPurchase: ProductPurchase;
  };
