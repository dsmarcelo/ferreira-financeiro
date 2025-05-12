"use server";
import { z } from "zod";
import {
  addExpense,
  addRecurrenceRule,
  updateExpense,
} from "@/server/queries/expense";
import { revalidatePath } from "next/cache";
import type { ExpenseInsert } from "@/server/db/schema/expense";

const expenseFormSchema = z.object({
  description: z.string().min(1),
  value: z.string().min(1),
  date: z.string(),
  type: z.enum(["one_time", "installment", "recurring"]),
  source: z.enum(["personal", "store", "product_purchase"]),
  isPaid: z.boolean().optional(),
  parentId: z.number().optional(),
  recurrenceRuleId: z.string().optional(),
  installmentNumber: z.number().optional(),
  totalInstallments: z.number().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Partial<Record<keyof ExpenseInsert, string[]>>;
}

export async function actionAddExpense(
  prevState: ActionResponse,
  formData: FormData,
) {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = expenseFormSchema.safeParse({
      ...data,
      value: data.value,
      isPaid: data.isPaid === "on",
      parentId: data.parentId ? Number(data.parentId) : undefined,
      installmentNumber: data.installmentNumber
        ? Number(data.installmentNumber)
        : undefined,
      totalInstallments: data.totalInstallments
        ? Number(data.totalInstallments)
        : undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Por favor, corrija os erros no formulário.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await addExpense(parsed.data);
    revalidatePath("/despesas");

    return {
      success: true,
      message: "Despesa adicionada com sucesso!",
      errors: undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao adicionar despesa.",
      errors: undefined,
    };
  }
}

const recurrenceRuleSchema = z.object({
  type: z.enum(["monthly", "weekly", "yearly"]),
  startDate: z.string(),
  endDate: z.string().optional(),
  value: z.string().optional(),
  description: z.string().optional(),
});

// Toggle isPaid for any expense
export async function actionToggleExpenseIsPaid(id: number, isPaid: boolean) {
  try {
    await updateExpense(id, { isPaid });
    revalidatePath("/compras-produtos");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao atualizar despesa.",
    };
  }
}

export async function actionAddRecurrenceRule(
  prevState: ActionResponse,
  formData: FormData,
) {
  const data = Object.fromEntries(formData.entries());
  const parse = recurrenceRuleSchema.safeParse(data);
  if (!parse.success) {
    return {
      success: false,
      message: "Dados inválidos",
      errors: parse.error.flatten().fieldErrors,
    };
  }
  await addRecurrenceRule(parse.data);
  revalidatePath("/despesas");
  return {
    success: true,
    message: "Regra de recorrência adicionada com sucesso!",
  };
}
