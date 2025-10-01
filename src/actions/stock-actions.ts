"use server";

import { revalidatePath } from "next/cache";
import { deleteStock } from "@/server/queries/stock-queries";
import { z } from "zod";
import { incrementStock } from "@/server/queries/product-queries";

export async function actionDeleteStock(id: number): Promise<void> {
  await deleteStock(id);
  revalidatePath("/estoque");
}

const incrementSchema = z.object({
  productId: z.number().int().positive(),
  amount: z.number().positive(),
});

export interface IncrementStockResponse {
  success: boolean;
  message: string;
}

export async function actionIncrementStock(
  _prev: IncrementStockResponse | undefined,
  formData: FormData,
): Promise<IncrementStockResponse> {
  const productId = Number(formData.get("productId"));
  const amount = Number(formData.get("amount"));

  const parsed = incrementSchema.safeParse({ productId, amount });
  if (!parsed.success) {
    return {
      success: false,
      message: "Dados inválidos para adicionar estoque",
    };
  }

  try {
    await incrementStock(productId, amount);
    revalidatePath("/estoque");
    return { success: true, message: "Estoque atualizado" };
  } catch (e) {
    return {
      success: false,
      message: (e as Error)?.message ?? "Erro ao atualizar estoque",
    };
  }
}

