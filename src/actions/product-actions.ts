"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "@/server/queries/product-queries";

const productSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  cost: z.number().min(0, { message: "Custo inválido" }),
  price: z.number().min(0, { message: "Preço inválido" }),
  // Accept decimal quantities (e.g., 0.5). Validate as number >= 0.
  quantity: z.number().min(0, { message: "Quantidade inválida" }),
});

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export async function actionCreateProduct(
  _prev: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  const name = formData.get("name");
  const costStr = formData.get("cost");
  const priceStr = formData.get("price");
  const quantityStr = formData.get("quantity");

  const cost = typeof costStr === "string" ? Number(costStr) : undefined;
  const price = typeof priceStr === "string" ? Number(priceStr) : undefined;
  const quantity = typeof quantityStr === "string" ? Number(quantityStr) : undefined;

  const parsed = productSchema.safeParse({ name, cost, price, quantity });
  if (!parsed.success) {
    return {
      success: false,
      message: "Corrija os erros no formulário.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createProduct({
      name: name as string,
      cost: cost!.toFixed(2),
      price: price!.toFixed(2),
      // Store as decimal string in DB
      quantity: String(quantity!),
    });
    revalidatePath("/estoque");
    return { success: true, message: "Produto criado com sucesso" };
  } catch (e) {
    return {
      success: false,
      message: (e as Error)?.message ?? "Erro ao criar produto",
    };
  }
}

export async function actionUpdateProduct(
  _prev: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  const id = Number(formData.get("id"));
  if (!id || isNaN(id)) return { success: false, message: "ID inválido" };

  const name = formData.get("name");
  const costStr = formData.get("cost");
  const priceStr = formData.get("price");
  const quantityStr = formData.get("quantity");

  const cost = typeof costStr === "string" ? Number(costStr) : undefined;
  const price = typeof priceStr === "string" ? Number(priceStr) : undefined;
  const quantity = typeof quantityStr === "string" ? Number(quantityStr) : undefined;

  const parsed = productSchema.safeParse({ name, cost, price, quantity });
  if (!parsed.success) {
    return {
      success: false,
      message: "Corrija os erros no formulário.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateProduct(id, {
      name: name as string,
      cost: cost!.toFixed(2),
      price: price!.toFixed(2),
      // Store as decimal string in DB
      quantity: String(quantity!),
    });
    revalidatePath("/estoque");
    return { success: true, message: "Produto atualizado" };
  } catch (e) {
    return {
      success: false,
      message: (e as Error)?.message ?? "Erro ao atualizar produto",
    };
  }
}

export async function actionDeleteProduct(id: number): Promise<void> {
  await deleteProduct(id);
  revalidatePath("/estoque");
}

export async function actionListProducts(query?: string) {
  return listProducts(query);
}

