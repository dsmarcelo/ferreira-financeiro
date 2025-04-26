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
import { format } from "date-fns";

const cashRegisterInsertSchema = z.object({
  date: z.date().min(new Date("2024-01-01"), {
    message: "Data inválida",
  }),
  value: z.number().min(0, {
    message: "Valor inválido",
  }),
});

// Server action to create a cash register entry
export async function actionCreateCashRegister(
  _prevState: { message?: string } | undefined,
  formData: FormData,
): Promise<{ message: string }> {
  // Parse form data
  const dateStr = formData.get("date");
  // Ensure dateStr is a string before converting
  const date = typeof dateStr === "string" ? new Date(dateStr) : undefined;

  const valueStr = formData.get("amount"); // 'amount' is the form field, 'value' is the DB field
  // Ensure valueStr is a string before converting
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;

  // Validate using Zod
  const result = cashRegisterInsertSchema.safeParse({ date, value });
  if (!result.success) {
    // Return error messages for useActionState
    return {
      message: result.error.errors.map((e) => e.message).join("; "),
    };
  }

  try {
    // Convert date to yyyy-MM-dd string and value to string for DB
    const dbDate = date ? format(date, "yyyy-MM-dd") : undefined;
    const dbValue = value !== undefined ? value.toFixed(2) : undefined;
    await createCashRegister({ date: dbDate!, value: dbValue! });
    revalidatePath("/caixa");
    return { message: "Caixa adicionado com sucesso!" };
  } catch (error) {
    // Use nullish coalescing for error message
    return { message: (error as Error)?.message ?? "Erro ao adicionar caixa." };
  }
}

// Server action to update a cash register entry
export async function actionUpdateCashRegister(
  _prevState: { message?: string } | undefined,
  formData: FormData,
): Promise<{ message: string }> {
  // Get the ID from the form data
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    return { message: "ID inválido" };
  }
  console.log("id", id);
  console.log("formData", formData);
  // Parse form data (same as create)
  const dateStr = formData.get("date");
  const date = typeof dateStr === "string" ? new Date(dateStr) : undefined;

  const valueStr = formData.get("amount"); // 'amount' is the form field, 'value' is the DB field
  const value = typeof valueStr === "string" ? Number(valueStr) : undefined;

  // Validate using Zod (same schema as create)
  const result = cashRegisterInsertSchema.safeParse({ date, value });
  if (!result.success) {
    return {
      message: result.error.errors.map((e) => e.message).join("; "),
    };
  }

  try {
    // Convert date to yyyy-MM-dd string and value to string for DB
    const dbDate = date ? format(date, "yyyy-MM-dd") : undefined;
    const dbValue = value !== undefined ? value.toFixed(2) : undefined;

    // Update the record
    const updated = await updateCashRegister(id, {
      date: dbDate!,
      value: dbValue!,
    });

    if (!updated) {
      return { message: "Registro não encontrado" };
    }

    revalidatePath("/caixa");
    return { message: "Caixa atualizado com sucesso!" };
  } catch (error) {
    return {
      message: (error as Error)?.message ?? "Erro ao atualizar caixa.",
    };
  }
}

// Server action to delete a cash register entry
export async function actionDeleteCashRegister(id: string) {
  await deleteCashRegister(id);
  revalidatePath("/caixa");
}

// Server action to get a cash register entry by ID
export async function actionGetCashRegisterById(id: string) {
  return getCashRegisterById(id);
}

// Server action to list cash register entries (optionally by date range)
export async function actionListCashRegisters(
  startDate?: string,
  endDate?: string,
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
