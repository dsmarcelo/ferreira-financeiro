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

/**
 * Standard response for server actions, including optional field errors.
 */
export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Partial<Record<keyof ProductPurchaseInsert, string[]>> & {
    installments?: InstallmentFieldErrors[];
  };
}

/**
 * Field errors for a single installment.
 */
export type InstallmentFieldErrors = Partial<
  Record<keyof ProductPurchaseInstallmentInsert, string[]>
>;

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
    // Ensure totalAmount is a string for DB
    const dbValue =
      totalAmount !== undefined ? totalAmount.toFixed(2) : undefined;
    const purchase = await createProductPurchase({
      ...result.data,
      totalAmount: dbValue!,
    });
    if (!purchase) {
      return {
        success: false,
        message: "Erro ao criar compra de produto.",
      };
    }

    // --- Handle installments creation ---
    const installmentsRaw = formData.get("installments");
    if (typeof installmentsRaw === "string") {
      // --- Zod validation for installments ---
      const productPurchaseInstallmentInsertSchema = z.object({
        productPurchaseId: z.number().optional(),
        description: z.string().min(1),
        amount: z.string(),
        dueDate: z.string(),
        isPaid: z.boolean().optional(),
        installmentNumber: z.number().optional(),
        paidAt: z.string().optional(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
      });
      const installmentsArraySchema = z.array(
        productPurchaseInstallmentInsertSchema,
      );
      let installments: ProductPurchaseInstallmentInsert[] = [];
      try {
        const parsed: unknown = JSON.parse(installmentsRaw); // Type as unknown for Zod
        const result = installmentsArraySchema.safeParse(parsed);
        if (!result.success) {
          // Group Zod issues by installment index and field
          const fieldErrorsRaw: Record<number, InstallmentFieldErrors> = {};
          for (const issue of result.error.issues) {
            const [idx, key] = issue.path;
            if (typeof idx === "number" && typeof key === "string") {
              const fieldKey = key as keyof ProductPurchaseInstallmentInsert;
              fieldErrorsRaw[idx] ??= {};
              fieldErrorsRaw[idx][fieldKey] ??= [];
              fieldErrorsRaw[idx][fieldKey].push(issue.message);
            }
          }
          const installmentsErrors = Object.values(fieldErrorsRaw);
          return {
            success: false,
            message: "Erro ao validar parcelas.",
            errors: { installments: installmentsErrors },
          };
        }
        // Convert date strings to Date objects to match DB type expectations
        installments = result.data.map((inst) => ({
          ...inst,
          createdAt: inst.createdAt ? new Date(inst.createdAt) : undefined,
          updatedAt: inst.updatedAt ? new Date(inst.updatedAt) : undefined,
          paidAt: inst.paidAt ? new Date(inst.paidAt) : undefined,
        }));
      } catch (_e) {
        return {
          success: false,
          message: "Erro ao processar parcelas da compra.",
        };
      }
      console.log("[DEBUG] Parsed installments:", installments);
      // At this point, installments is a valid ProductPurchaseInstallmentInsert[] (validated by Zod)
      for (const inst of installments) {
        try {
          const created = await actionCreateProductPurchaseInstallment({
            ...inst,
            productPurchaseId: purchase.id,
          });
          console.log("[DEBUG] Created installment:", created);
        } catch (err) {
          console.error("[DEBUG] Failed to create installment:", inst, err);
        }
      }
    }

    revalidatePath("/compras-produtos");
    return {
      success: true,
      message: "Compra de produto criada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar compra de produto:", error);
    return {
      success: false,
      message: "Erro ao criar compra de produto.",
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
  purchase.installments = purchase.installments.map((inst) => ({
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
  if (
    data.description !== undefined &&
    (!data.description || data.description.trim().length === 0)
  ) {
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
  return installments.map((inst) => ({
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
