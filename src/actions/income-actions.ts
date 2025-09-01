"use server";

import {
  createIncome,
  getIncomeById,
  updateIncome,
  deleteIncome,
  listIncomes,
  sumIncomesByDateRange,
  sumProfitAmountsByDateRange,
  sumTotalProfitByDateRange,
  createIncomeWithItems,
  updateIncomeWithItems,
} from "@/server/queries/income-queries";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const incomeInsertSchema = z.object({
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  date: z.string({ message: "Data inválida" }),
  time: z.string({ message: "Hora inválida" }),
  value: z.number().min(0, { message: "Valor inválido" }).optional(),
  profitMargin: z.number().min(0).max(100, { message: "Margem de lucro deve estar entre 0% e 100%" }),
  soldItemsJson: z.string().optional(),
  customerId: z.number().int().optional(),
});

// Define a common ActionResponse interface for form actions
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

// Server action to create an income entry
export async function actionCreateIncome(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  // Parse form data
  const description = formData.get("description");
  const date = formData.get("date");
  const time = formData.get("time");
  const totalValueStr = formData.get("totalValue"); // Ignored for persistence; recomputed on server
  const profitMarginStr = formData.get("profitMargin");
  const totalValue = typeof totalValueStr === "string" ? Number(totalValueStr) : undefined;
  const profitMargin = typeof profitMarginStr === "string" ? Number(profitMarginStr) : undefined;

  // We will recompute value on the server from items + extraValue - discount (without profit)
  // Keep reading totalValue for validation fallback but do not persist it directly
  const clientProvidedValue = totalValue;
  const soldItemsJson = formData.get("soldItemsJson");
  const discountTypeRaw = formData.get("discountType");
  const discountValueStr = formData.get("discountValue");
  const customerIdStr = formData.get("customerId");
  const discountValue = typeof discountValueStr === "string" ? Number(discountValueStr) : undefined;
  // Read but do not persist customerId; schema does not include it
  const _customerId = typeof customerIdStr === "string" && customerIdStr.length > 0 ? Number(customerIdStr) : undefined;

  // Normalize discount type: treat empty string or invalid as undefined
  const discountType: "percent" | "fixed" | undefined =
    discountTypeRaw === "percent" || discountTypeRaw === "fixed" ? (discountTypeRaw) : undefined;

  // Validate using Zod, passing raw values
  // Validate base fields first (value will be recomputed but allow client value for basic presence)
  const result = incomeInsertSchema.safeParse({ description, date, time, value: clientProvidedValue, profitMargin, soldItemsJson, discountType, discountValue, customerId: _customerId });
  if (!result.success) {
    // Return field-level errors and a general message
    return {
      success: false,
      message: "Por favor, corrija os erros no formulário.",
      errors: result.error.flatten().fieldErrors,
    };
  }

    try {
    // Combine date and time into a single DateTime object
    const dateTimeString = `${date as string}T${time as string}:00`;
    const dateTime = new Date(dateTimeString);

    // Compute items total and final value server-side
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
      } catch {
        // ignore bad json
      }
    }

    // Decide persisted value: if items exist, compute with discount; otherwise use client-provided total
    const subtotal = itemsTotal;
    const discountAmount = discountType === "percent"
      ? ((discountValue ?? 0) / 100) * subtotal
      : (discountValue ?? 0);
    const computedFromItems = Math.max(0, subtotal - discountAmount);
    const persistedNumericValue = items.length > 0
      ? computedFromItems
      : (clientProvidedValue ?? 0);

    // Format values for DB
    const dbValue = persistedNumericValue.toFixed(2);
    const dbProfitMargin = profitMargin !== undefined ? profitMargin.toFixed(2) : "0";

    if (items.length > 0) {
      await createIncomeWithItems({
        description: description as string,
        dateTime: dateTime,
        value: dbValue,
        profitMargin: dbProfitMargin,
      }, items);
    } else {
      await createIncome({
        description: description as string,
        dateTime: dateTime,
        value: dbValue,
        profitMargin: dbProfitMargin,
      });
    }
    revalidatePath("/caixa");
    return { success: true, message: "Receita adicionada com sucesso!" };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao adicionar receita.",
    };
  }
}

// Server action to update an income entry
export async function actionUpdateIncome(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  const id = Number(formData.get("id"));
  if (!id || isNaN(id)) {
    return { success: false, message: "ID inválido" };
  }

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
  // Read but do not persist customerId; schema does not include it
  const _customerId = typeof customerIdStr === "string" && customerIdStr.length > 0 ? Number(customerIdStr) : undefined;

  const discountType: "percent" | "fixed" | undefined =
    discountTypeRaw === "percent" || discountTypeRaw === "fixed" ? (discountTypeRaw) : undefined;

  // Validate using Zod, passing raw values
  const result = incomeInsertSchema.safeParse({ description, date, time, value: totalValue, profitMargin, discountType, discountValue, customerId: _customerId });
  if (!result.success) {
    return {
      success: false,
      message: "Por favor, corrija os erros no formulário.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    // Combine date and time into a single DateTime object
    const dateTimeString = `${date as string}T${time as string}:00`;
    const dateTime = new Date(dateTimeString);

    // Parse items (if any) to compute new total and optionally update linkage
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
      } catch {
        // ignore bad json
      }
    }

    // If items exist, compute; otherwise use client-provided total
    const subtotal = itemsTotal;
    const computedDiscount = discountType === "percent"
      ? ((discountValue ?? 0) / 100) * subtotal
      : (discountValue ?? 0);
    const computedFromItems = Math.max(0, subtotal - computedDiscount);
    const persistedNumericValue = items.length > 0
      ? computedFromItems
      : (totalValue ?? 0);

    const dataToUpdate = {
      description: description as string,
      dateTime: dateTime,
      value: persistedNumericValue.toFixed(2),
      profitMargin: profitMargin?.toFixed(2) ?? "0",
    } as const;

    if (items.length > 0) {
      await updateIncomeWithItems(id, dataToUpdate, items);
    } else {
      await updateIncome(id, dataToUpdate);
    }
    revalidatePath("/caixa");
    return { success: true, message: "Receita atualizada com sucesso!" };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao atualizar receita.",
    };
  }
}

// Server action to delete an income entry
export async function actionDeleteIncome(id: number) {
  await deleteIncome(id);
  revalidatePath("/caixa");
}

// Server action to get an income entry by ID
export async function actionGetIncomeById(id: number) {
  return getIncomeById(id);
}

// Server action to list income entries (optionally by date range)
export async function actionListIncomes(
  startDate: string,
  endDate: string,
) {
  return listIncomes(startDate, endDate);
}

// Server action to get the sum of income values in a date range
export async function actionSumIncomesByDateRange(
  startDate: string,
  endDate: string,
) {
  return sumIncomesByDateRange(startDate, endDate);
}

// Server action to get the sum of profit amounts in a date range
export async function actionSumProfitAmountsByDateRange(
  startDate: string,
  endDate: string,
) {
  return sumProfitAmountsByDateRange(startDate, endDate);
}

// Server action to get the total profit data in a date range
export async function actionSumTotalProfitByDateRange(
  startDate: string,
  endDate: string,
) {
  return sumTotalProfitByDateRange(startDate, endDate);
}
