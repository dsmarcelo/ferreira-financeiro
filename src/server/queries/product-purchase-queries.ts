"use server";

import { db } from "@/server/db";
import {
  productPurchase,
  productPurchaseInstallment,
} from "@/server/db/schema/product-purchase";
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
  try {
    const [created] = await db.insert(productPurchase).values(data).returning();
    if (!created)
      throw new Error("Falha ao criar a entrada/saída de mercadoria.");
    return created;
  } catch (error) {
    throw new Error(
      `Erro ao criar entrada/saída de mercadoria: ${(error as Error).message}`,
    );
  }
}

// Get a product purchase by ID
export async function getProductPurchaseById(
  id: number,
): Promise<ProductPurchase | undefined> {
  try {
    const [entry] = await db
      .select()
      .from(productPurchase)
      .where(eq(productPurchase.id, id));
    return entry;
  } catch (error) {
    throw new Error(
      `Erro ao buscar compra de produto por ID: ${(error as Error).message}`,
    );
  }
}

// Update a product purchase by ID
export async function updateProductPurchase(
  id: number,
  data: Partial<ProductPurchaseInsert>,
): Promise<ProductPurchase | undefined> {
  try {
    const [updated] = await db
      .update(productPurchase)
      .set(data)
      .where(eq(productPurchase.id, id))
      .returning();
    return updated;
  } catch (error) {
    throw new Error(
      `Erro ao atualizar compra de produto: ${(error as Error).message}`,
    );
  }
}

// Delete a product purchase by ID
export async function deleteProductPurchase(id: number): Promise<void> {
  try {
    await db.delete(productPurchase).where(eq(productPurchase.id, id));
  } catch (error) {
    throw new Error(
      `Erro ao deletar compra de produto: ${(error as Error).message}`,
    );
  }
}

// List all product purchases (by createdAt date range)
export async function listProductPurchases(
  startDate: string,
  endDate: string,
): Promise<ProductPurchase[] | []> {
  try {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return await db
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
  } catch (error) {
    throw new Error(
      `Erro ao listar compras de produtos: ${(error as Error).message}`,
    );
  }
}

// Get the sum of totalAmount in a date range
export async function sumProductPurchaseByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  try {
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
  } catch (error) {
    throw new Error(
      `Erro ao somar compras de produtos: ${(error as Error).message}`,
    );
  }
}

// --- ProductPurchaseInstallment CRUD ---

// Create a new installment
export async function createProductPurchaseInstallment(
  data: ProductPurchaseInstallmentInsert,
): Promise<ProductPurchaseInstallment> {
  try {
    if (!data.description) throw new Error("Descrição da parcela obrigatória.");
    const [created] = await db
      .insert(productPurchaseInstallment)
      .values(data)
      .returning();
    if (!created)
      throw new Error("Falha ao criar parcela da compra de produto.");
    return created;
  } catch (error) {
    throw new Error(
      `Erro ao criar parcela da compra de produto: ${(error as Error).message}`,
    );
  }
}

// Get an installment by ID
export async function getProductPurchaseInstallmentById(
  id: number,
): Promise<ProductPurchaseInstallment | undefined> {
  try {
    const [entry] = await db
      .select()
      .from(productPurchaseInstallment)
      .where(eq(productPurchaseInstallment.id, id));
    return entry;
  } catch (error) {
    throw new Error(
      `Erro ao buscar parcela por ID: ${(error as Error).message}`,
    );
  }
}

// Update an installment by ID
export async function updateProductPurchaseInstallment(
  id: number,
  data: Partial<ProductPurchaseInstallmentInsert>,
): Promise<ProductPurchaseInstallment | undefined> {
  try {
    if (data.description !== undefined && !data.description) {
      throw new Error("Descrição da parcela obrigatória.");
    }
    const [updated] = await db
      .update(productPurchaseInstallment)
      .set(data)
      .where(eq(productPurchaseInstallment.id, id))
      .returning();
    return updated;
  } catch (error) {
    throw new Error(`Erro ao atualizar parcela: ${(error as Error).message}`);
  }
}

// Delete an installment by ID
export async function deleteProductPurchaseInstallment(
  id: number,
): Promise<void> {
  try {
    await db
      .delete(productPurchaseInstallment)
      .where(eq(productPurchaseInstallment.id, id));
  } catch (error) {
    throw new Error(`Erro ao deletar parcela: ${(error as Error).message}`);
  }
}

// List all installments for a given purchase
export async function listInstallmentsByPurchaseId(
  productPurchaseId: number,
): Promise<ProductPurchaseInstallment[]> {
  try {
    return await db
      .select()
      .from(productPurchaseInstallment)
      .where(
        eq(productPurchaseInstallment.productPurchaseId, productPurchaseId),
      );
  } catch (error) {
    throw new Error(`Erro ao listar parcelas: ${(error as Error).message}`);
  }
}

// Fetch a product purchase with its installments
export async function getProductPurchaseWithInstallments(
  id: number,
): Promise<ProductPurchaseWithInstallments | undefined> {
  try {
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
  } catch (error) {
    throw new Error(
      `Erro ao buscar compra com parcelas: ${(error as Error).message}`,
    );
  }
}

// List all Installments by date range
export async function listInstallmentsByDateRange(
  startDate: string,
  endDate: string,
): Promise<ProductPurchaseInstallment[]> {
  console.log(startDate, endDate);
  try {
    if (startDate && endDate) {
      return await db
        .select()
        .from(productPurchaseInstallment)
        .where(
          and(
            gte(productPurchaseInstallment.dueDate, startDate),
            lte(productPurchaseInstallment.dueDate, endDate),
          ),
        );
    }
    return [];
  } catch (error) {
    throw new Error(`Erro ao listar parcelas: ${(error as Error).message}`);
  }
}

export async function sumInstallmentsByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  try {
    const result = await db
      .select({ total: sum(productPurchaseInstallment.amount) })
      .from(productPurchaseInstallment)
      .where(
        and(
          gte(productPurchaseInstallment.dueDate, startDate),
          lte(productPurchaseInstallment.dueDate, endDate),
        ),
      );
    return Number(result[0]?.total ?? 0);
  } catch (error) {
    throw new Error(`Erro ao somar parcelas: ${(error as Error).message}`);
  }
}

export async function listProductPurchasesWithInstallmentsByDateRange(
  startDate: string,
  endDate: string,
): Promise<ProductPurchaseWithInstallments[]> {
  try {
    if (startDate && endDate) {
      const purchases = await listProductPurchases(startDate, endDate);
      const installments = await listInstallmentsByDateRange(
        startDate,
        endDate,
      );
      return purchases.map((purchase) => ({
        ...purchase,
        installments: installments.filter(
          (installment) => installment.productPurchaseId === purchase.id,
        ),
      }));
    }
    return [];
  } catch (error) {
    throw new Error(
      `Erro ao listar compras de produtos com parcelas: ${(error as Error).message}`,
    );
  }
}
