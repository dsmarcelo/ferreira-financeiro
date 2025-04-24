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
  date: z.date().min(new Date("2024-01-01"), {
    message: "Data inválida",
  }),
  amount: z.number().min(0, {
    message: "Valor inválido",
  }),
});

// Server action to create a cash register entry
export async function actionCreateCashRegister(data: CashRegisterInsert) {
  const result = await createCashRegister(data);
  revalidatePath("/caixa");
  return result;
}

// Server action to update a cash register entry
export async function actionUpdateCashRegister(
  id: string,
  data: Partial<CashRegisterInsert>,
) {
  const result = await updateCashRegister(id, data);
  revalidatePath("/caixa");
  return result;
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
