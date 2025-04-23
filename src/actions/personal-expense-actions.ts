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
import type { PersonalExpenseInsert } from "@/server/db/personal-expense";

// Server action to create a personal expense entry
export async function actionCreatePersonalExpense(data: PersonalExpenseInsert) {
  const result = await createPersonalExpense(data);
  revalidatePath("/despesas-pessoais");
  return result;
}

// Server action to update a personal expense entry
export async function actionUpdatePersonalExpense(
  id: string,
  data: Partial<PersonalExpenseInsert>,
) {
  const result = await updatePersonalExpense(id, data);
  revalidatePath("/despesas-pessoais");
  return result;
}

// Server action to delete a personal expense entry
export async function actionDeletePersonalExpense(id: string) {
  await deletePersonalExpense(id);
  revalidatePath("/despesas-pessoais");
}

// Server action to get a personal expense entry by ID
export async function actionGetPersonalExpenseById(id: string) {
  return getPersonalExpenseById(id);
}

// Server action to list personal expenses (optionally by date range)
export async function actionListPersonalExpenses(
  startDate?: string,
  endDate?: string,
) {
  return listPersonalExpenses(startDate, endDate);
}

// Server action to get the sum of values in a date range
export async function actionSumPersonalExpenseByDateRange(
  startDate: string,
  endDate: string,
) {
  return sumPersonalExpenseByDateRange(startDate, endDate);
}
