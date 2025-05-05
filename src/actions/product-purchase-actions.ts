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
import type {
  ProductPurchase,
  ProductPurchaseInsert,
} from "@/server/db/schema/product-purchase";
import { z } from "zod";

const productPurchaseInsertSchema = z.object({
  dueDate: z.string({ message: "Data inválida" }),
  value: z.number().min(0, { message: "Valor inválido" }),
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
  const dueDate = formData.get("dueDate");
  const valueStr = formData.get("amount");
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;
  const description = formData.get("description");
  const isPaid = formData.get("isPaid") === "on";

  const result = productPurchaseInsertSchema.safeParse({
    dueDate,
    value,
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
    const dbValue = value !== undefined ? value.toFixed(2) : undefined;
    await createProductPurchase({
      dueDate: dueDate as string,
      value: dbValue!,
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
  const idRaw = formData.get("id");
  const id = Number(idRaw);
  if (!id || isNaN(id)) {
    return { success: false, message: "ID inválido" };
  }
  const dueDate = formData.get("dueDate");
  const valueStr = formData.get("amount");
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;
  const description = formData.get("description");
  const isPaid = formData.get("isPaid") === "on";

  const result = productPurchaseInsertSchema.safeParse({
    dueDate,
    value,
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
    await updateProductPurchase(id, {
      dueDate: dueDate as string,
      value: value!.toFixed(2),
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
