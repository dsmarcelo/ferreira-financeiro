"use server";

import { z } from "zod";
import { createRecurringExpense } from "@/server/queries/recurring-expense-queries";
import { revalidatePath } from "next/cache";
import type { RecurringExpenseInsert } from "@/server/db/schema/recurring-expense";

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof RecurringExpenseInsert]?: string[];
  };
}

const recurringExpenseSchema = z.object({
  description: z.string().min(1),
  value: z.string().min(1),
  recurrenceType: z.enum(["monthly", "weekly", "yearly"]),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
});

export type RecurringExpenseFormData = z.infer<typeof recurringExpenseSchema>;

export async function actionCreateRecurringExpense(
  _prevState: ActionResponse,
  formData: FormData,
) {
  const data = Object.fromEntries(formData.entries());
  const parse = recurringExpenseSchema.safeParse({
    description: data.description,
    value: data.value,
    recurrenceType: data.recurrenceType,
    startDate: data.startDate,
    endDate: data.endDate && data.endDate !== "" ? data.endDate : undefined,
  });
  if (!parse.success) {
    return {
      success: false,
      message: "Dados inválidos",
      errors: parse.error.flatten().fieldErrors,
    };
  }
  await createRecurringExpense(parse.data);
  revalidatePath("/compras-produtos");
  return {
    success: true,
    message: "Despesa recorrente adicionada com sucesso!",
  };
}
