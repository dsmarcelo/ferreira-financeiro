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
  date: z
    .string()
    .refine(
      (val) =>
        /^\d{4}-\d{2}-\d{2}$/.test(val) &&
        new Date(val + "T00:00:00") >= new Date("2024-01-01T00:00:00"),
      { message: "Data inválida" },
    ),
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
  const date = formData.get("date");
  const valueStr = formData.get("amount");
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;
  const description = formData.get("description");
  const isPaid = formData.get("isPaid") === "on";

  const result = productPurchaseInsertSchema.safeParse({
    date,
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
      date: date as string,
      value: dbValue!,
      description: description as string,
      isPaid,
    });
    revalidatePath("/despesas-de-produtos");
    return {
      success: true,
      message: "Despesa de produto adicionada com sucesso!",
    };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error)?.message ?? "Erro ao adicionar despesa de produto.",
    };
  }
}

// Toggle isPaid for a product purchase
export async function actionToggleProductPurchaseIsPaid(
  id: string,
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
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }
  const date = formData.get("date");
  const valueStr = formData.get("amount");
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;
  const description = formData.get("description");
  const isPaid = formData.get("isPaid") === "on";

  const result = productPurchaseInsertSchema.safeParse({
    date,
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
      date: date as string,
      value: value!.toFixed(2),
      description: description as string,
      isPaid,
    });
    revalidatePath("/despesas-de-produtos");
    return {
      success: true,
      message: "Despesa de produto atualizada com sucesso!",
    };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error)?.message ?? "Erro ao atualizar despesa de produto.",
    };
  }
}

// Server action to delete a product purchase entry
export async function actionDeleteProductPurchase(id: string): Promise<void> {
  await deleteProductPurchase(id);
  revalidatePath("/despesas-de-produtos");
}

// Server action to get a product purchase entry by ID
export async function actionGetProductPurchaseById(
  id: string,
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
