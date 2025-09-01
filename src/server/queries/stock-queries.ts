"use server";

import { db } from "../db";
import { products } from "../db/schema/products";
import { eq } from "drizzle-orm";

// Delete a stock item (product) by ID
export async function deleteStock(id: number): Promise<void> {
  await db.delete(products).where(eq(products.id, id));
}
