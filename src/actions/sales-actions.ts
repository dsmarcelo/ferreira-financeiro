"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Sale } from "@/server/db/schema/sales-schema";
import {
  createSale,
  deleteSale,
  getSaleById,
  listSales,
  sumSalesByDateRange,
  sumSalesProfitAmountsByDateRange,
  sumSalesTotalProfitByDateRange,
  createSaleWithItems,
  updateSaleWithItems,
  listItemsForSale,
  sumSalesProductProfitByDateRange,
  sumSalesRevenueAndProductProfitByDateRange,
} from "@/server/queries/sales-queries";

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    description?: string[];
    date?: string[];
    time?: string[];
    value?: string[];
    profitMargin?: string[];
  };
}

const saleInsertSchema = z.object({
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  date: z.string({ message: "Data inválida" }),
  time: z.string({ message: "Hora inválida" }),
  value: z.number().min(0, { message: "Valor inválido" }).optional(),
  profitMargin: z.number().min(0).max(100, { message: "Margem de lucro deve estar entre 0% e 100%" }),
  soldItemsJson: z.string().optional(),
  customerId: z.number().int().optional(),
  discountType: z.enum(["percent", "fixed"]).optional(),
  discountValue: z.number().optional(),
});

export async function actionCreateSale(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  const description = formData.get("description");
  const date = formData.get("date");
  const time = formData.get("time");
  const totalValueStr = formData.get("totalValue");
  const profitMarginStr = formData.get("profitMargin");
  const soldItemsJson = formData.get("soldItemsJson");
  const discountTypeRaw = formData.get("discountType");
  const discountValueStr = formData.get("discountValue");
  const customerIdStr = formData.get("customerId");

  const clientProvidedValue = typeof totalValueStr === "string" ? Number(totalValueStr) : undefined;
  const profitMargin = typeof profitMarginStr === "string" ? Number(profitMarginStr) : undefined;
  const discountValue = typeof discountValueStr === "string" ? Number(discountValueStr) : undefined;
  const customerId = typeof customerIdStr === "string" && customerIdStr.length > 0 ? Number(customerIdStr) : undefined;
  const discountType: "percent" | "fixed" | undefined =
    discountTypeRaw === "percent" || discountTypeRaw === "fixed" ? discountTypeRaw : undefined;

  const result = saleInsertSchema.safeParse({ description, date, time, value: clientProvidedValue, profitMargin, soldItemsJson, discountType, discountValue, customerId });
  if (!result.success) {
    return { success: false, message: "Por favor, corrija os erros no formulário.", errors: result.error.flatten().fieldErrors };
  }

  try {
    const dateTime = new Date(`${date as string}T${time as string}:00`);

    let itemsTotal = 0;
    const items: Array<{ productId: number; quantity: number; unitPrice: string }> = [];
    if (typeof soldItemsJson === "string" && soldItemsJson.trim().length > 0) {
      try {
        const parsed = JSON.parse(soldItemsJson) as Array<{ productId: number; quantity: number; unitPrice: number }>;
        for (const it of parsed) {
          if (typeof it.productId === "number" && typeof it.quantity === "number" && it.quantity > 0) {
            const unitPriceNum = typeof it.unitPrice === "number" ? it.unitPrice : 0;
            const unitPrice = unitPriceNum.toFixed(2);
            itemsTotal += unitPriceNum * it.quantity;
            items.push({ productId: it.productId, quantity: it.quantity, unitPrice });
          }
        }
      } catch {}
    }

    const subtotal = itemsTotal;
    const discountAmount = discountType === "percent" ? ((discountValue ?? 0) / 100) * subtotal : (discountValue ?? 0);
    const computedValue = Math.max(0, subtotal - discountAmount);

    const dbValue = computedValue.toFixed(2);

    if (items.length > 0) {
      await createSaleWithItems({
        description: description as string,
        dateTime,
        value: dbValue,
        customerId: customerId ?? null,
        discountType,
        discountValue: discountValue !== undefined ? discountValue.toFixed(2) : undefined,
      }, items);
    } else {
      await createSale({
        description: description as string,
        dateTime,
        value: dbValue,
        customerId: customerId ?? null,
        discountType,
        discountValue: discountValue !== undefined ? discountValue.toFixed(2) : undefined,
      });
    }
    revalidatePath("/vendas");
    revalidatePath("/caixa");
    revalidatePath("/estoque")
    return { success: true, message: "Venda adicionada com sucesso!" };
  } catch (error) {
    return { success: false, message: (error as Error)?.message ?? "Erro ao adicionar venda." };
  }
}

export async function actionUpdateSale(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  const id = Number(formData.get("id"));
  if (!id || isNaN(id)) return { success: false, message: "ID inválido" };

  const description = formData.get("description");
  const date = formData.get("date");
  const time = formData.get("time");
  const totalValueStr = formData.get("totalValue");
  const profitMarginStr = formData.get("profitMargin");
  const discountTypeRaw = formData.get("discountType");
  const discountValueStr = formData.get("discountValue");
  const customerIdStr = formData.get("customerId");
  const soldItemsJson = formData.get("soldItemsJson");

  const totalValue = typeof totalValueStr === "string" ? Number(totalValueStr) : undefined;
  const profitMargin = typeof profitMarginStr === "string" ? Number(profitMarginStr) : undefined;
  const discountValue = typeof discountValueStr === "string" ? Number(discountValueStr) : undefined;
  const customerId = typeof customerIdStr === "string" && customerIdStr.length > 0 ? Number(customerIdStr) : undefined;
  const discountType: "percent" | "fixed" | undefined =
    discountTypeRaw === "percent" || discountTypeRaw === "fixed" ? discountTypeRaw : undefined;

  const result = saleInsertSchema.safeParse({ description, date, time, value: totalValue, profitMargin, discountType, discountValue, customerId });
  if (!result.success) {
    return { success: false, message: "Por favor, corrija os erros no formulário.", errors: result.error.flatten().fieldErrors };
  }

  try {
    const dateTime = new Date(`${date as string}T${time as string}:00`);

    const items: Array<{ productId: number; quantity: number; unitPrice: string }> = [];
    let itemsTotal = 0;
    if (typeof soldItemsJson === "string" && soldItemsJson.trim().length > 0) {
      try {
        const parsed = JSON.parse(soldItemsJson) as Array<{ productId: number; quantity: number; unitPrice: number }>;
        for (const it of parsed) {
          if (typeof it.productId === "number" && typeof it.quantity === "number" && it.quantity > 0) {
            const unitPriceNum = typeof it.unitPrice === "number" ? it.unitPrice : 0;
            const unitPrice = unitPriceNum.toFixed(2);
            itemsTotal += unitPriceNum * it.quantity;
            items.push({ productId: it.productId, quantity: it.quantity, unitPrice });
          }
        }
      } catch {}
    }

    const subtotal = itemsTotal;
    const computedDiscount = discountType === "percent" ? ((discountValue ?? 0) / 100) * subtotal : (discountValue ?? 0);
    const computedValue = Math.max(0, subtotal - computedDiscount);

    const dataToUpdate = {
      description: description as string,
      dateTime,
      value: computedValue.toFixed(2),
      profitMargin: profitMargin?.toFixed(2) ?? "0",
      discountType,
      discountValue: discountValue !== undefined ? discountValue.toFixed(2) : undefined,
      customerId: customerId ?? null,
    } as const;

    // Always use the item-aware update so stock is properly restored/deducted
    // even when all items are removed in the edit form.
    await updateSaleWithItems(id, dataToUpdate, items);
    revalidatePath("/vendas");
    revalidatePath("/caixa");
    revalidatePath("/estoque")
    return { success: true, message: "Venda atualizada com sucesso!" };
  } catch (error) {
    return { success: false, message: (error as Error)?.message ?? "Erro ao atualizar venda." };
  }
}

export async function actionDeleteSale(id: number) {
  await deleteSale(id);
  revalidatePath("/vendas");
  revalidatePath("/caixa");
  revalidatePath("/estoque")
}

export async function actionGetSaleById(id: number) {
  return getSaleById(id);
}

export async function actionListSales(startDate: string, endDate: string): Promise<Sale[]> {
  return listSales(startDate, endDate);
}

export async function actionSumSalesByDateRange(startDate: string, endDate: string) {
  return sumSalesByDateRange(startDate, endDate);
}

export async function actionSumSalesProfitAmountsByDateRange(startDate: string, endDate: string) {
  return sumSalesProfitAmountsByDateRange(startDate, endDate);
}

export async function actionSumSalesTotalProfitByDateRange(startDate: string, endDate: string) {
  return sumSalesTotalProfitByDateRange(startDate, endDate);
}

export { listItemsForSale, sumSalesProductProfitByDateRange, sumSalesRevenueAndProductProfitByDateRange };
