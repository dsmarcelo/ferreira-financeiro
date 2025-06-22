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
} from "@/server/queries/income-queries";
import { revalidatePath } from "next/cache";
import type { IncomeInsert } from "@/server/db/schema/incomes-schema";
import { z } from "zod";

const incomeInsertSchema = z.object({
  date: z.string({ message: "Data inválida" }),
  value: z.number().min(0, { message: "Valor inválido" }),
  profitMargin: z.number().min(0).max(100, { message: "Margem de lucro deve estar entre 0% e 100%" }),
});

// Define a common ActionResponse interface for form actions
export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof IncomeInsert]?: string[];
  };
}

// Server action to create an income entry
export async function actionCreateIncome(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  // Parse form data
  const date = formData.get("date");
  const valueStr = formData.get("value");
  const profitMarginStr = formData.get("profitMargin");
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;
  const profitMargin = typeof profitMarginStr === "string" ? Number(profitMarginStr) : undefined;

  // Validate using Zod, passing raw values
  const result = incomeInsertSchema.safeParse({ date, value, profitMargin });
  if (!result.success) {
    // Return field-level errors and a general message
    return {
      success: false,
      message: "Por favor, corrija os erros no formulário.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    // Format values for DB (value with 2 decimals, profit margin as percentage with 2 decimals)
    const dbValue = value !== undefined ? value.toFixed(2) : undefined;
    const dbProfitMargin = profitMargin !== undefined ? profitMargin.toFixed(2) : undefined;

    await createIncome({
      date: date as string,
      value: dbValue!,
      profitMargin: dbProfitMargin!
    });
    revalidatePath("/receitas");
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

  const date = formData.get("date");
  const valueStr = formData.get("value");
  const profitMarginStr = formData.get("profitMargin");
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;
  const profitMargin = typeof profitMarginStr === "string" ? Number(profitMarginStr) : undefined;

  // Validate using Zod, passing raw values
  const result = incomeInsertSchema.safeParse({ date, value, profitMargin });
  if (!result.success) {
    return {
      success: false,
      message: "Por favor, corrija os erros no formulário.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await updateIncome(id, {
      date: date as string,
      value: value!.toFixed(2),
      profitMargin: profitMargin!.toFixed(2),
    });
    revalidatePath("/receitas");
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
  revalidatePath("/receitas");
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