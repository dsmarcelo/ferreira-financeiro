"use server";

import {
  createProductPurchase,
  getProductPurchaseById,
  updateProductPurchase,
  deleteProductPurchase,
  listProductPurchases,
  sumProductPurchaseByDateRange,
} from "@/server/queries/product-purchase-queries";
import { revalidatePath } from "next/cache";
import type { ProductPurchaseInsert } from "@/server/db/product-purchase";

// Server action to create a product purchase entry
export async function actionCreateProductPurchase(data: ProductPurchaseInsert) {
  const result = await createProductPurchase(data);
  revalidatePath("/despesas-de-produtos");
  return result;
}

// Server action to update a product purchase entry
export async function actionUpdateProductPurchase(
  id: string,
  data: Partial<ProductPurchaseInsert>,
) {
  const result = await updateProductPurchase(id, data);
  revalidatePath("/despesas-de-produtos");
  return result;
}

// Server action to delete a product purchase entry
export async function actionDeleteProductPurchase(id: string) {
  await deleteProductPurchase(id);
  revalidatePath("/despesas-de-produtos");
}

// Server action to get a product purchase entry by ID
export async function actionGetProductPurchaseById(id: string) {
  return getProductPurchaseById(id);
}

// Server action to list product purchases (optionally by date range)
export async function actionListProductPurchases(
  startDate?: string,
  endDate?: string,
) {
  return listProductPurchases(startDate, endDate);
}

// Server action to get the sum of values in a date range
export async function actionSumProductPurchaseByDateRange(
  startDate: string,
  endDate: string,
) {
  return sumProductPurchaseByDateRange(startDate, endDate);
}
