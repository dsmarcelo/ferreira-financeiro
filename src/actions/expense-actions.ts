"use server";
import { z } from "zod";
import {
  addExpense,
  addRecurrenceRule,
  updateExpense,
} from "@/server/queries/expense-queries";
import { revalidatePath } from "next/cache";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";

const expenseFormSchema = z.object({
  description: z.string().min(1, { message: "Descrição obrigatória" }),
  value: z.string().min(1, { message: "Valor obrigatório" }),
  date: z.string({ message: "Data inválida" }),
  type: z.enum(["one_time", "installment", "recurring"]),
  source: z.enum(["personal", "store", "product_purchase"]),
  isPaid: z.boolean().optional(),
  parentId: z.number().optional(),
  recurrenceRuleId: z.string().optional(),
  installmentNumber: z.number().optional(),
  totalInstallments: z.number().optional(),
  installmentId: z.string().uuid().optional(), // NEW: to link all installments as uuid
});

const updateExpenseSchema = expenseFormSchema.extend({
  id: z.number(),
  type: z.enum(["one_time", "installment", "recurring"]).optional(),
  source: z.enum(["personal", "store", "product_purchase"]).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>; // includes optional installmentId

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Partial<Record<keyof ExpenseInsert, string[]>>;
}

export async function actionAddExpense(
  _prevState: ActionResponse,
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
      installmentId: data.installmentId ?? undefined, // NEW: pass through as uuid string if present
    });
    console.log(parsed.error);
    if (!parsed.success) {
      return {
        success: false,
        message: "Por favor, corrija os erros no formulário.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await addExpense(parsed.data);
    switch (parsed.data.source) {
      case "personal":
        revalidatePath("/despesas-pessoais");
        break;
      case "store":
        revalidatePath("/despesas-loja");
        break;
      case "product_purchase":
        revalidatePath("/compras-produtos");
        break;
    }

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
// Now supports passing an installmentId to link multiple expenses as a group of installments.

// Update expense
export async function actionUpdateExpense(
  _prevState: ActionResponse,
  formData: FormData,
) {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = updateExpenseSchema.safeParse({
      ...data,
      id: Number(data.id),
      date: data.date,
      isPaid: data.isPaid === "on",
      parentId: data.parentId ? Number(data.parentId) : undefined,
    });
    console.log(parsed.error);
    if (!parsed.success) {
      return {
        success: false,
        message: "Por favor, corrija os erros no formulário.",
        errors: parsed.error?.flatten().fieldErrors,
      };
    }

    await updateExpense(parsed.data.id, parsed.data);
    switch (parsed.data.source) {
      case "personal":
        revalidatePath("/despesas-pessoais");
        break;
      case "store":
        revalidatePath("/despesas-loja");
        break;
      case "product_purchase":
        revalidatePath("/compras-produtos");
        break;
    }

    return {
      success: true,
      message: "Despesa atualizada com sucesso!",
      errors: undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao atualizar despesa.",
      errors: undefined,
    };
  }
}

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

const recurrenceRuleSchema = z.object({
  type: z.enum(["monthly", "weekly", "yearly"]),
  startDate: z.string(),
  endDate: z.string().optional(),
  value: z.string().optional(),
  description: z.string().optional(),
});

export async function actionAddRecurrenceRule(
  _prevState: ActionResponse,
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
