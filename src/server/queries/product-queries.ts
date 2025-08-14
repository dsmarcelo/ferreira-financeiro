"use server";

import { db } from "../db";
import { products } from "../db/schema/products";
import type { Product, ProductInsert } from "../db/schema/products";
import { asc, eq, ilike } from "drizzle-orm";

export async function createProduct(data: ProductInsert): Promise<Product> {
  const [created] = await db.insert(products).values(data).returning();
  if (!created) throw new Error("Falha ao criar produto.");
  return created;
}

export async function updateProduct(
  id: number,
  data: Partial<ProductInsert>,
): Promise<Product | undefined> {
  const [updated] = await db
    .update(products)
    .set(data)
    .where(eq(products.id, id))
    .returning();
  return updated;
}

export async function deleteProduct(id: number): Promise<void> {
  await db.delete(products).where(eq(products.id, id));
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const [row] = await db.select().from(products).where(eq(products.id, id));
  return row;
}

export async function listProducts(query?: string): Promise<Product[]> {
  if (query && query.trim().length > 0) {
    return db
      .select()
      .from(products)
      .where(ilike(products.name, `%${query}%`))
      .orderBy(asc(products.name));
  }
  return db.select().from(products).orderBy(asc(products.name));
}

export async function decrementStock(
  items: Array<{ productId: number; quantity: number }>,
): Promise<void> {
  if (!items.length) return;

  // Use a single transaction to ensure atomic stock updates
  await db.transaction(async (tx) => {
    for (const item of items) {
      const [row] = await tx
        .select()
        .from(products)
        .where(eq(products.id, item.productId));
      if (!row) throw new Error("Produto não encontrado");
      const newQty = (row.quantity ?? 0) - item.quantity;
      if (newQty < 0) {
        throw new Error(
          `Estoque insuficiente para o produto "${row.name}". Disponível: ${row.quantity}, solicitado: ${item.quantity}`,
        );
      }
      await tx
        .update(products)
        .set({ quantity: newQty })
        .where(eq(products.id, item.productId));
    }
  });
}


