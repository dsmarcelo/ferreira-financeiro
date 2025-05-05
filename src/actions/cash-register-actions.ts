"use server";

import {
  createCashRegister,
  getCashRegisterById,
  updateCashRegister,
  deleteCashRegister,
  listCashRegisters,
  sumCashRegisterByDateRange,
} from "@/server/queries/cash-register-queries";
import { revalidatePath } from "next/cache";
import type { CashRegisterInsert } from "@/server/db/schema/cash-register";
import { z } from "zod";

const cashRegisterInsertSchema = z.object({
  date: z
    .string()
    .refine(
      (val) =>
        /^\d{4}-\d{2}-\d{2}$/.test(val) &&
        new Date(val + "T00:00:00") >= new Date("2024-01-01T00:00:00"),
      { message: "Data inválida" },
    ),
  value: z.number().min(0, { message: "Valor inválido" }),
});

// Define a common ActionResponse interface for form actions

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof CashRegisterInsert]?: string[];
  };
}

// Server action to create a cash register entry
export async function actionCreateCashRegister(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  // Parse form data
  const date = formData.get("date");
  const valueStr = formData.get("amount");
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;

  // Validate using Zod, passing raw values
  const result = cashRegisterInsertSchema.safeParse({ date, value });
  if (!result.success) {
    // Return field-level errors and a general message
    return {
      success: false,
      message: "Por favor, corrija os erros no formulário.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    // Format value for DB (always as string with 2 decimals)
    const dbValue = value !== undefined ? value.toFixed(2) : undefined;
    await createCashRegister({ date: date as string, value: dbValue! });
    revalidatePath("/caixa");
    return { success: true, message: "Caixa adicionado com sucesso!" };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao adicionar caixa.",
    };
  }
}

// Server action to update a cash register entry
export async function actionUpdateCashRegister(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  const id = formData.get("id");
  if (!id || typeof id !== "number") {
    return { success: false, message: "ID inválido" };
  }
  const date = formData.get("date");
  const valueStr = formData.get("amount");
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;

  // Validate using Zod, passing raw values
  const result = cashRegisterInsertSchema.safeParse({ date, value });
  if (!result.success) {
    return {
      success: false,
      message: "Por favor, corrija os erros no formulário.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await updateCashRegister(id, {
      date: date as string,
      value: value!.toFixed(2),
    });
    revalidatePath("/caixa");
    return { success: true, message: "Caixa atualizado com sucesso!" };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao atualizar caixa.",
    };
  }
}

// Server action to delete a cash register entry
export async function actionDeleteCashRegister(id: number) {
  await deleteCashRegister(id);
  revalidatePath("/caixa");
}

// Server action to get a cash register entry by ID
export async function actionGetCashRegisterById(id: number) {
  return getCashRegisterById(id);
}

// Server action to list cash register entries (optionally by date range)
export async function actionListCashRegisters(
  startDate: string,
  endDate: string,
) {
  return listCashRegisters(startDate, endDate);
}

// Server action to get the sum of values in a date range
export async function actionSumCashRegisterByDateRange(
  startDate: string,
  endDate: string,
) {
  return sumCashRegisterByDateRange(startDate, endDate);
}
