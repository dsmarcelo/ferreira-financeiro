import { db } from "@/server/db";
import { productPurchase } from "@/server/db/schema/product-purchase";
import type {
  ProductPurchase,
  ProductPurchaseInsert,
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
  id: string,
): Promise<ProductPurchase | undefined> {
  const [entry] = await db
    .select()
    .from(productPurchase)
    .where(eq(productPurchase.id, id));
  return entry;
}

// Update a product purchase by ID
export async function updateProductPurchase(
  id: string,
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
export async function deleteProductPurchase(id: string): Promise<void> {
  await db.delete(productPurchase).where(eq(productPurchase.id, id));
}

// List all product purchases (optionally by date range)
export async function listProductPurchases(
  startDate?: string,
  endDate?: string,
): Promise<ProductPurchase[]> {
  if (startDate && endDate) {
    return db
      .select()
      .from(productPurchase)
      .where(
        and(
          gte(productPurchase.date, startDate),
          lte(productPurchase.date, endDate),
        ),
      );
  }
  return db.select().from(productPurchase);
}

// Get the sum of values in a date range
export async function sumProductPurchaseByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  const result = await db
    .select({ sum: sum(productPurchase.value) })
    .from(productPurchase)
    .where(
      and(
        gte(productPurchase.date, startDate),
        lte(productPurchase.date, endDate),
      ),
    );
  return Number(result[0]?.sum ?? 0);
}
