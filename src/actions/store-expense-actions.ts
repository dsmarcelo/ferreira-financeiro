"use server";

import {
  createStoreExpense,
  getStoreExpenseById,
  updateStoreExpense,
  deleteStoreExpense,
  listStoreExpenses,
  sumStoreExpenseByDateRange,
} from "@/server/queries/store-expense-queries";
import { revalidatePath } from "next/cache";
import type {
  StoreExpense,
  StoreExpenseInsert,
} from "@/server/db/schema/store-expense";
import { z } from "zod";

const storeExpenseInsertSchema = z.object({
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
  dueDate: z.string().optional(),
  isPaid: z.boolean().optional(),
});

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof StoreExpenseInsert]?: string[];
  };
}

// Server action to create a store expense entry
export async function actionCreateStoreExpense(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  const date = formData.get("date");
  const valueStr = formData.get("amount");
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;
  const description = formData.get("description");
  const dueDate = formData.get("dueDate");
  const isPaid = formData.get("isPaid") === "on";

  const result = storeExpenseInsertSchema.safeParse({
    date,
    value,
    description,
    dueDate,
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
    await createStoreExpense({
      date: date as string,
      value: dbValue!,
      description: description as string,
      dueDate: dueDate ? (dueDate as string) : undefined,
      isPaid,
    });
    revalidatePath("/despesas-da-loja");
    return {
      success: true,
      message: "Despesa da loja adicionada com sucesso!",
    };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error)?.message ?? "Erro ao adicionar despesa da loja.",
    };
  }
}

// Server action to update a store expense entry
export async function actionUpdateStoreExpense(
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
  const dueDate = formData.get("dueDate");
  const isPaid = formData.get("isPaid") === "on";

  const result = storeExpenseInsertSchema.safeParse({
    date,
    value,
    description,
    dueDate,
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
    await updateStoreExpense(id, {
      date: date as string,
      value: value!.toFixed(2),
      description: description as string,
      dueDate: dueDate ? (dueDate as string) : undefined,
      isPaid,
    });
    revalidatePath("/despesas-da-loja");
    return {
      success: true,
      message: "Despesa da loja atualizada com sucesso!",
    };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error)?.message ?? "Erro ao atualizar despesa da loja.",
    };
  }
}

// Server action to delete a store expense entry
export async function actionDeleteStoreExpense(id: string): Promise<void> {
  await deleteStoreExpense(id);
  revalidatePath("/despesas-da-loja");
}

// Server action to get a store expense entry by ID
export async function actionGetStoreExpenseById(
  id: string,
): Promise<StoreExpense | undefined> {
  return getStoreExpenseById(id);
}

// Server action to list store expenses (optionally by date range)
export async function actionListStoreExpenses(
  startDate?: string,
  endDate?: string,
): Promise<StoreExpense[]> {
  return listStoreExpenses(startDate, endDate);
}

// Server action to get the sum of values in a date range
export async function actionSumStoreExpenseByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  return sumStoreExpenseByDateRange(startDate, endDate);
}
