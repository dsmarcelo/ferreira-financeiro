import { z } from "zod";
import { addExpense, addRecurrenceRule } from "@/server/queries/expense";
import { revalidatePath } from "next/cache";

export const expenseFormSchema = z.object({
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

export async function actionAddExpense(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const parse = expenseFormSchema.safeParse({
    ...data,
    value: data.value,
    isPaid: data.isPaid === "on" || data.isPaid === true,
    parentId: data.parentId ? Number(data.parentId) : undefined,
    installmentNumber: data.installmentNumber
      ? Number(data.installmentNumber)
      : undefined,
    totalInstallments: data.totalInstallments
      ? Number(data.totalInstallments)
      : undefined,
  });
  if (!parse.success) {
    return {
      success: false,
      message: "Dados inválidos",
      errors: parse.error.flatten().fieldErrors,
    };
  }
  await addExpense(parse.data);
  revalidatePath("/despesas");
  return { success: true, message: "Despesa adicionada com sucesso!" };
}

export const recurrenceRuleSchema = z.object({
  type: z.enum(["monthly", "weekly", "yearly"]),
  startDate: z.string(),
  endDate: z.string().optional(),
  value: z.string().optional(),
  description: z.string().optional(),
});

export type RecurrenceRuleFormData = z.infer<typeof recurrenceRuleSchema>;

export async function actionAddRecurrenceRule(
  prevState: any,
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
