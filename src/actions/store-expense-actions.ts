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
import type { StoreExpenseInsert } from "@/server/db/store-expense";

// Server action to create a store expense entry
export async function actionCreateStoreExpense(data: StoreExpenseInsert) {
  const result = await createStoreExpense(data);
  revalidatePath("/despesas-da-loja");
  return result;
}

// Server action to update a store expense entry
export async function actionUpdateStoreExpense(
  id: string,
  data: Partial<StoreExpenseInsert>,
) {
  const result = await updateStoreExpense(id, data);
  revalidatePath("/despesas-da-loja");
  return result;
}

// Server action to delete a store expense entry
export async function actionDeleteStoreExpense(id: string) {
  await deleteStoreExpense(id);
  revalidatePath("/despesas-da-loja");
}

// Server action to get a store expense entry by ID
export async function actionGetStoreExpenseById(id: string) {
  return getStoreExpenseById(id);
}

// Server action to list store expenses (optionally by date range)
export async function actionListStoreExpenses(
  startDate?: string,
  endDate?: string,
) {
  return listStoreExpenses(startDate, endDate);
}

// Server action to get the sum of values in a date range
export async function actionSumStoreExpenseByDateRange(
  startDate: string,
  endDate: string,
) {
  return sumStoreExpenseByDateRange(startDate, endDate);
}
