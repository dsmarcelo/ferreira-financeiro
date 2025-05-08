"use server";

import { db } from "@/server/db";
import { productPurchase, productPurchaseInstallment } from "@/server/db/schema/product-purchase";
import type {
  ProductPurchase,
  ProductPurchaseInsert,
  ProductPurchaseInstallment,
  ProductPurchaseInstallmentInsert,
  ProductPurchaseWithInstallments,
} from "@/server/db/schema/product-purchase";
import { eq, and, gte, lte, sum } from "drizzle-orm";

// Create a new product purchase entry
export async function createProductPurchase(
  data: ProductPurchaseInsert,
): Promise<ProductPurchase> {
  const [created] = await db.insert(productPurchase).values(data).returning();
  if (!created)
    throw new Error("Falha ao criar a entrada/saída de mercadoria.");
  return created;
}

// Get a product purchase by ID
export async function getProductPurchaseById(
  id: number,
): Promise<ProductPurchase | undefined> {
  const [entry] = await db
    .select()
    .from(productPurchase)
    .where(eq(productPurchase.id, id));
  return entry;
}

// Update a product purchase by ID
export async function updateProductPurchase(
  id: number,
  data: Partial<ProductPurchaseInsert>,
): Promise<ProductPurchase | undefined> {
  const [updated] = await db
    .update(productPurchase)
    .set(data)
    .where(eq(productPurchase.id, id))
    .returning();
  return updated;
}

// Delete a product purchase by ID
export async function deleteProductPurchase(id: number): Promise<void> {
  await db.delete(productPurchase).where(eq(productPurchase.id, id));
}

// List all product purchases (by createdAt date range)
export async function listProductPurchases(
  startDate: string,
  endDate: string,
): Promise<ProductPurchase[] | []> {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return db
      .select()
      .from(productPurchase)
      .where(
        and(
          gte(productPurchase.createdAt, start),
          lte(productPurchase.createdAt, end),
        ),
      );
  }
  return [];
}

// Get the sum of totalAmount in a date range
export async function sumProductPurchaseByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result = await db
      .select({ total: sum(productPurchase.totalAmount) })
      .from(productPurchase)
      .where(
        and(
          gte(productPurchase.createdAt, start),
          lte(productPurchase.createdAt, end),
        ),
      );
    return Number(result[0]?.total ?? 0);
  }
  return 0;
}

// --- ProductPurchaseInstallment CRUD ---

// Create a new installment
export async function createProductPurchaseInstallment(
  data: ProductPurchaseInstallmentInsert,
): Promise<ProductPurchaseInstallment> {
  if (!data.description) throw new Error("Descrição da parcela obrigatória.");
  const [created] = await db.insert(productPurchaseInstallment).values(data).returning();
  if (!created) throw new Error("Falha ao criar parcela da compra de produto.");
  return created;
}

// Get an installment by ID
export async function getProductPurchaseInstallmentById(
  id: number,
): Promise<ProductPurchaseInstallment | undefined> {
  const [entry] = await db
    .select()
    .from(productPurchaseInstallment)
    .where(eq(productPurchaseInstallment.id, id));
  return entry;
}

// Update an installment by ID
export async function updateProductPurchaseInstallment(
  id: number,
  data: Partial<ProductPurchaseInstallmentInsert>,
): Promise<ProductPurchaseInstallment | undefined> {
  if (data.description !== undefined && !data.description) {
    throw new Error("Descrição da parcela obrigatória.");
  }
  const [updated] = await db
    .update(productPurchaseInstallment)
    .set(data)
    .where(eq(productPurchaseInstallment.id, id))
    .returning();
  return updated;
}

// Delete an installment by ID
export async function deleteProductPurchaseInstallment(id: number): Promise<void> {
  await db.delete(productPurchaseInstallment).where(eq(productPurchaseInstallment.id, id));
}

// List all installments for a given purchase
export async function listInstallmentsByPurchaseId(
  productPurchaseId: number,
): Promise<ProductPurchaseInstallment[]> {
  return db
    .select()
    .from(productPurchaseInstallment)
    .where(eq(productPurchaseInstallment.productPurchaseId, productPurchaseId));
}

// Fetch a product purchase with its installments
export async function getProductPurchaseWithInstallments(
  id: number,
): Promise<ProductPurchaseWithInstallments | undefined> {
  const [purchase] = await db
    .select()
    .from(productPurchase)
    .where(eq(productPurchase.id, id));
  if (!purchase) return undefined;
  const installments = await listInstallmentsByPurchaseId(id);
  return {
    ...purchase,
    installments,
  };
}

