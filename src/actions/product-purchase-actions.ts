"use server";

import {
  createProductPurchase,
  getProductPurchaseById,
  updateProductPurchase,
  deleteProductPurchase,
  listProductPurchases,
  sumProductPurchaseByDateRange,
  createProductPurchaseInstallment,
  getProductPurchaseInstallmentById,
  updateProductPurchaseInstallment,
  deleteProductPurchaseInstallment,
  listInstallmentsByPurchaseId,
  getProductPurchaseWithInstallments,
} from "@/server/queries/product-purchase-queries";
import { revalidatePath } from "next/cache";
import type {
  ProductPurchase,
  ProductPurchaseInsert,
  ProductPurchaseInstallment,
  ProductPurchaseInstallmentInsert,
  ProductPurchaseWithInstallments,
} from "@/server/db/schema/product-purchase";
import { z } from "zod";

const productPurchaseInsertSchema = z.object({
  totalAmount: z.number().min(0, { message: "Valor inválido" }),
  description: z.string().min(1, { message: "Descrição obrigatória" }),
  isPaid: z.boolean().optional(),
});

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof ProductPurchaseInsert]?: string[];
  };
}

// Server action to create a product purchase entry
export async function actionCreateProductPurchase(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  const totalAmountStr = formData.get("totalAmount");
  const totalAmount =
    typeof totalAmountStr === "string" ? Number(totalAmountStr) : undefined;
  const description = formData.get("description");
  const isPaid = formData.get("isPaid") === "on";

  const result = productPurchaseInsertSchema.safeParse({
    totalAmount,
    description,
    isPaid,
  });
  if (!result.success) {
    return {
      success: false,
      message: "Por favor, corrija os erros no formulário.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const dbValue =
      totalAmount !== undefined ? totalAmount.toFixed(2) : undefined;
    await createProductPurchase({
      totalAmount: dbValue!,
      description: description as string,
      isPaid,
    });
    revalidatePath("/despesas-de-produtos");
    return {
      success: true,
      message: "Compra de produto adicionada com sucesso!",
    };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error)?.message ?? "Erro ao adicionar compra de produto.",
    };
  }
}

// Toggle isPaid for a product purchase
export async function actionToggleProductPurchaseIsPaid(
  id: number,
  isPaid: boolean,
): Promise<void> {
  await updateProductPurchase(id, { isPaid });
  revalidatePath("/despesas-de-produtos");
}

// Server action to update a product purchase entry
export async function actionUpdateProductPurchase(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  // If updating installments via form, require description
  // (Installments are typically updated via their own action, but keep for future-proofing)

  const idRaw = formData.get("id");
  const id = Number(idRaw);
  if (!id || isNaN(id)) {
    return { success: false, message: "ID inválido" };
  }
  const totalAmountStr = formData.get("totalAmount");
  const totalAmount =
    typeof totalAmountStr === "string" ? Number(totalAmountStr) : undefined;
  const description = formData.get("description");
  const isPaid = formData.get("isPaid") === "on";

  const result = productPurchaseInsertSchema.safeParse({
    totalAmount,
    description,
    isPaid,
  });
  if (!result.success) {
    return {
      success: false,
      message: "Por favor, corrija os erros no formulário.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const dbValue =
      totalAmount !== undefined ? totalAmount.toFixed(2) : undefined;
    await updateProductPurchase(id, {
      totalAmount: dbValue!,
      description: description as string,
      isPaid,
    });
    revalidatePath("/despesas-de-produtos");
    return {
      success: true,
      message: "Compra de produto atualizada com sucesso!",
    };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error)?.message ?? "Erro ao atualizar compra de produto.",
    };
  }
}

// Server action to delete a product purchase entry
export async function actionDeleteProductPurchase(id: number): Promise<void> {
  await deleteProductPurchase(id);
  revalidatePath("/despesas-de-produtos");
}

// Server action to get a product purchase entry by ID
export async function actionGetProductPurchaseById(
  id: number,
): Promise<ProductPurchase | undefined> {
  return getProductPurchaseById(id);
}

// Server action to get a product purchase WITH installments by ID
export async function actionGetProductPurchaseWithInstallments(
  id: number,
): Promise<ProductPurchaseWithInstallments | undefined> {
  // Ensure all installments returned include the description field
  const purchase = await getProductPurchaseWithInstallments(id);
  if (!purchase) return undefined;
  purchase.installments = purchase.installments.map(inst => ({
    ...inst,
    description: inst.description || "",
  }));
  return purchase;
}

// --- Installment Actions ---

export async function actionCreateProductPurchaseInstallment(
  data: ProductPurchaseInstallmentInsert,
): Promise<ProductPurchaseInstallment | undefined> {
  if (!data.description || data.description.trim().length === 0) {
    console.error("Descrição da parcela obrigatória.");
    return undefined;
  }
  try {
    return await createProductPurchaseInstallment(data);
  } catch (error) {
    console.error("Erro ao criar parcela da compra de produto:", error);
    return undefined;
  }
}

export async function actionUpdateProductPurchaseInstallment(
  id: number,
  data: Partial<ProductPurchaseInstallmentInsert>,
): Promise<ProductPurchaseInstallment | undefined> {
  if (data.description !== undefined && (!data.description || data.description.trim().length === 0)) {
    console.error("Descrição da parcela obrigatória.");
    return undefined;
  }
  try {
    return await updateProductPurchaseInstallment(id, data);
  } catch (error) {
    console.error("Erro ao atualizar parcela da compra de produto:", error);
    return undefined;
  }
}

export async function actionDeleteProductPurchaseInstallment(
  id: number,
): Promise<void> {
  try {
    await deleteProductPurchaseInstallment(id);
    revalidatePath("/despesas-de-produtos");
  } catch (error) {
    console.error("Erro ao deletar parcela da compra de produto:", error);
    throw error;
  }
}

export async function actionGetProductPurchaseInstallmentById(
  id: number,
): Promise<ProductPurchaseInstallment | undefined> {
  const inst = await getProductPurchaseInstallmentById(id);
  if (!inst) return undefined;
  return {
    ...inst,
    description: inst.description || "",
  };
}

export async function actionListInstallmentsByPurchaseId(
  productPurchaseId: number,
): Promise<ProductPurchaseInstallment[]> {
  const installments = await listInstallmentsByPurchaseId(productPurchaseId);
  return installments.map(inst => ({
    ...inst,
    description: inst.description || "",
  }));
}

// Server action to list product purchases (optionally by date range)
export async function actionListProductPurchases(
  startDate: string,
  endDate: string,
): Promise<ProductPurchase[]> {
  return listProductPurchases(startDate, endDate);
}

// Server action to get the sum of values in a date range
export async function actionSumProductPurchaseByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  return sumProductPurchaseByDateRange(startDate, endDate);
}
