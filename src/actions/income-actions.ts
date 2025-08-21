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
  discountType: z.enum(["percent", "fixed"]).optional(),
  discountValue: z.number().min(0).optional(),
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
  const extraValueStr = formData.get("extraValue"); // This is the extra value (without profit)
  const totalValueStr = formData.get("totalValue"); // This is the calculated total (with profit)
  const profitMarginStr = formData.get("profitMargin");
  const extraValue = typeof extraValueStr === "string" ? Number(extraValueStr) : 0;
  const totalValue = typeof totalValueStr === "string" ? Number(totalValueStr) : undefined;
  const profitMargin = typeof profitMarginStr === "string" ? Number(profitMarginStr) : undefined;

  // Total should NOT include profit: use provided totalValue if present, otherwise fall back to extraValue
  const value = totalValue ?? extraValue;
  const soldItemsJson = formData.get("soldItemsJson");
  const discountTypeRaw = formData.get("discountType");
  const discountValueStr = formData.get("discountValue");
  const customerIdStr = formData.get("customerId");
  const discountValue = typeof discountValueStr === "string" ? Number(discountValueStr) : undefined;
  const customerId = typeof customerIdStr === "string" && customerIdStr.length > 0 ? Number(customerIdStr) : undefined;

  // Normalize discount type: treat empty string or invalid as undefined
  const discountType: "percent" | "fixed" | undefined =
    discountTypeRaw === "percent" || discountTypeRaw === "fixed" ? (discountTypeRaw as "percent" | "fixed") : undefined;

  // Validate using Zod, passing raw values
  const result = incomeInsertSchema.safeParse({ description, date, time, value, profitMargin, soldItemsJson, discountType, discountValue, customerId });
  if (!result.success) {
    // Return field-level errors and a general message
    return {
      success: false,
      message: "Por favor, corrija os erros no formulário.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  // Ensure we have a valid value
  if (value === undefined || isNaN(value)) {
    return {
      success: false,
      message: "Valor total é obrigatório.",
      errors: { value: ["Valor total é obrigatório"] },
    };
  }

    try {
    // Combine date and time into a single DateTime object
    const dateTimeString = `${date as string}T${time as string}:00`;
    const dateTime = new Date(dateTimeString);

    // Format values for DB (value with 2 decimals, profit margin as percentage with 2 decimals)
    const dbValue = value !== undefined ? value.toFixed(2) : undefined;
    const dbProfitMargin = profitMargin !== undefined ? profitMargin.toFixed(2) : undefined;

    const items: Array<{ productId: number; quantity: number; unitPrice: string }> = [];
    if (typeof soldItemsJson === "string" && soldItemsJson.trim().length > 0) {
      try {
        const parsed = JSON.parse(soldItemsJson) as Array<{ productId: number; quantity: number; unitPrice: number }>;
        for (const it of parsed) {
          if (typeof it.productId === "number" && typeof it.quantity === "number" && it.quantity > 0) {
            const unitPrice = typeof it.unitPrice === "number" ? it.unitPrice.toFixed(2) : "0.00";
            items.push({ productId: it.productId, quantity: it.quantity, unitPrice });
          }
        }
      } catch {
        // ignore bad json
      }
    }

    if (items.length > 0) {
      await createIncomeWithItems({
        description: description as string,
        dateTime: dateTime,
        value: dbValue!,
        profitMargin: dbProfitMargin!,
        discountType: discountType,
        discountValue: discountValue !== undefined ? discountValue.toFixed(2) : undefined,
        customerId: customerId,
      }, items);
    } else {
      await createIncome({
        description: description as string,
        dateTime: dateTime,
        value: dbValue!,
        profitMargin: dbProfitMargin!,
        discountType: discountType,
        discountValue: discountValue !== undefined ? discountValue.toFixed(2) : undefined,
        customerId: customerId,
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
  const valueStr = formData.get("value");
  const profitMarginStr = formData.get("profitMargin");
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;
  const profitMargin = typeof profitMarginStr === "string" ? Number(profitMarginStr) : undefined;

  // Validate using Zod, passing raw values
  const result = incomeInsertSchema.safeParse({ description, date, time, value, profitMargin });
  if (!result.success) {
    return {
      success: false,
      message: "Por favor, corrija os erros no formulário.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  // Ensure we have a valid value for updates
  if (value === undefined || isNaN(value)) {
    return {
      success: false,
      message: "Valor é obrigatório.",
      errors: { value: ["Valor é obrigatório"] },
    };
  }

  try {
    // Combine date and time into a single DateTime object
    const dateTimeString = `${date as string}T${time as string}:00`;
    const dateTime = new Date(dateTimeString);

            await updateIncome(id, {
          description: description as string,
          dateTime: dateTime,
          value: value.toFixed(2),
          profitMargin: profitMargin?.toFixed(2) ?? "0",
        });
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