"use server";

import {
  createPersonalExpense,
  getPersonalExpenseById,
  updatePersonalExpense,
  deletePersonalExpense,
  listPersonalExpenses,
  sumPersonalExpenseByDateRange,
} from "@/server/queries/personal-expense-queries";
import { revalidatePath } from "next/cache";
import type {
  PersonalExpense,
  PersonalExpenseInsert,
} from "@/server/db/schema/personal-expense";
import { z } from "zod";

const personalExpenseInsertSchema = z.object({
  dueDate: z
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
    [K in keyof PersonalExpenseInsert]?: string[];
  };
}

// Server action to create a personal expense entry
export async function actionCreatePersonalExpense(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  const dueDate = formData.get("dueDate");
  const valueStr = formData.get("amount");
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;
  const description = formData.get("description");
  const isPaid = formData.get("isPaid") === "on";

  const result = personalExpenseInsertSchema.safeParse({
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
    await createPersonalExpense({
      dueDate: dueDate as string,
      value: dbValue!,
      description: description as string,
      isPaid,
    });
    revalidatePath("/despesas-pessoais");
    return {
      success: true,
      message: "Despesa pessoal adicionada com sucesso!",
    };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error)?.message ?? "Erro ao adicionar despesa pessoal.",
    };
  }
}

// Server action to update a personal expense entry
export async function actionUpdatePersonalExpense(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" ? Number(idRaw) : undefined;
  if (!id || isNaN(id)) {
    return { success: false, message: "ID inválido" };
  }
  const dueDate = formData.get("dueDate");
  const valueStr = formData.get("amount");
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;
  const description = formData.get("description");
  const isPaid = formData.get("isPaid") === "on";

  const result = personalExpenseInsertSchema.safeParse({
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
    await updatePersonalExpense(id, {
      dueDate: dueDate as string,
      value: value!.toFixed(2),
      description: description as string,
      isPaid,
    });
    revalidatePath("/despesas-pessoais");
    return {
      success: true,
      message: "Despesa pessoal atualizada com sucesso!",
    };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error)?.message ?? "Erro ao atualizar despesa pessoal.",
    };
  }
}

export async function actionTogglePersonalExpenseIsPaid(
  id: number,
  isPaid: boolean,
): Promise<void> {
  await updatePersonalExpense(id, {
    isPaid,
  });
  revalidatePath("/despesas-pessoais");
}

// Server action to delete a personal expense entry
export async function actionDeletePersonalExpense(id: number): Promise<void> {
  await deletePersonalExpense(id);
  revalidatePath("/despesas-pessoais");
}

// Server action to get a personal expense entry by ID
export async function actionGetPersonalExpenseById(
  id: number,
): Promise<PersonalExpense | undefined> {
  return getPersonalExpenseById(id);
}

// Server action to list personal expenses (optionally by date range)
export async function actionListPersonalExpenses(
  startDate: string,
  endDate: string,
): Promise<PersonalExpense[]> {
  return listPersonalExpenses(startDate, endDate);
}

// Server action to get the sum of values in a date range
export async function actionSumPersonalExpenseByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  return sumPersonalExpenseByDateRange(startDate, endDate);
}
