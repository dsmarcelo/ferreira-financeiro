"use server";
import { z } from "zod";
import {
  addExpense,
  deleteExpense as dbDeleteExpense,
  updateExpense,
  getExpenseById,
} from "@/server/queries/expense-queries";
import { revalidatePath } from "next/cache";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";

// One-time expense schema & action

const oneTimeExpenseSchema = z.object({
  description: z.string().min(1, { message: "Descrição obrigatória" }),
  value: z.string().min(1, { message: "Valor obrigatório" }),
  date: z.string({ message: "Data inválida" }),
  type: z.literal("one_time"),
  source: z.enum(["personal", "store", "product_purchase"]),
  isPaid: z.boolean().optional(),
});

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Partial<Record<keyof ExpenseInsert, string[]>>;
}

export async function actionAddOneTimeExpense(
  _prevState: ActionResponse,
  formData: FormData,
) {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = oneTimeExpenseSchema.safeParse({
      ...data,
      value: data.value,
      isPaid: data.isPaid === "on",
    });
    if (!parsed.success) {
      return {
        success: false,
        message: "Por favor, corrija os erros no formulário.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    await addExpense(parsed.data);
    revalidatePath("/compras-produtos");
    return { success: true, message: "Despesa adicionada com sucesso!" };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao adicionar despesa.",
      errors: undefined,
    };
  }
}

// Installment expense schema & action

const installmentExpenseSchema = z.object({
  description: z.string().min(1, { message: "Descrição obrigatória" }),
  value: z.string().min(1, { message: "Valor obrigatório" }),
  date: z.string({ message: "Data inválida" }),
  type: z.literal("installment"),
  source: z.enum(["personal", "store", "product_purchase"]),
  isPaid: z.boolean().optional(),
  installmentNumber: z.number().min(1),
  totalInstallments: z.number().min(1),
  groupId: z.string().uuid(),
});

export async function actionAddInstallmentExpense(
  _prevState: ActionResponse,
  formData: FormData,
) {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = installmentExpenseSchema.safeParse({
      ...data,
      value: data.value,
      isPaid: data.isPaid === "on",
      installmentNumber: data.installmentNumber
        ? Number(data.installmentNumber)
        : undefined,
      totalInstallments: data.totalInstallments
        ? Number(data.totalInstallments)
        : undefined,
      groupId: data.groupId,
    });
    if (!parsed.success) {
      return {
        success: false,
        message: "Por favor, corrija os erros no formulário.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    await addExpense(parsed.data);
    revalidatePath("/compras-produtos");
    return {
      success: true,
      message: "Despesa parcelada adicionada com sucesso!",
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao adicionar despesa.",
      errors: undefined,
    };
  }
}

// Recurring expense schema & action

const recurringExpenseSchema = z.object({
  description: z.string().min(1, { message: "Descrição obrigatória" }),
  value: z.string().min(1, { message: "Valor obrigatório" }),
  date: z.string({ message: "Data inválida" }),
  type: z.literal("recurring"),
  source: z.enum(["personal", "store", "product_purchase"]),
  isPaid: z.boolean().optional(),
  recurrenceType: z.enum(["weekly", "monthly", "yearly", "custom_days"]),
  recurrenceInterval: z.coerce.number().optional(),
  recurrenceEndDate: z.string().optional(),
});

export async function actionAddRecurringExpense(
  _prevState: ActionResponse,
  formData: FormData,
) {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = recurringExpenseSchema.safeParse({
      ...data,
      value: data.value,
      isPaid: data.isPaid === "on",
      recurrenceInterval: data.recurrenceInterval
        ? Number(data.recurrenceInterval)
        : undefined,
      recurrenceEndDate: data.recurrenceEndDate ?? undefined,
    });
    if (!parsed.success) {
      console.error(parsed.error);
      return {
        success: false,
        message: "Por favor, corrija os erros no formulário.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    // Recurring logic
    const today = new Date();
    const startDate = new Date(parsed.data.date);
    const endDate = parsed.data.recurrenceEndDate
      ? new Date(parsed.data.recurrenceEndDate)
      : today;
    const occurrences: Omit<ExpenseInsert, "id">[] = [];
    const groupId = crypto.randomUUID();
    const currentDate = new Date(startDate);
    if (startDate < today) {
      while (currentDate <= endDate && currentDate <= today) {
        occurrences.push({
          ...parsed.data,
          date: currentDate.toISOString().slice(0, 10),
          type: "recurring",
          groupId,
        });
        switch (parsed.data.recurrenceType) {
          case "weekly":
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case "monthly":
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          case "yearly":
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
          case "custom_days":
            currentDate.setDate(
              currentDate.getDate() + (parsed.data.recurrenceInterval ?? 1),
            );
            break;
          default:
            currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      for (const occ of occurrences) {
        await addExpense(occ);
      }
    } else {
      await addExpense({ ...parsed.data, type: "recurring", groupId });
    }

    revalidatePath("/compras-produtos");
    return {
      success: true,
      message: "Despesa recorrente adicionada com sucesso!",
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao adicionar despesa.",
      errors: undefined,
    };
  }
}

// Delete expense action

export async function actionDeleteExpense(
  _prevState: ActionResponse,
  formData: FormData,
) {
  try {
    const id = Number(formData.get("id"));
    if (!id) {
      return {
        success: false,
        message: "ID da despesa inválido para exclusão.",
      };
    }
    await dbDeleteExpense(id);
    revalidatePath("/compras-produtos");
    revalidatePath("/despesas-pessoais");
    revalidatePath("/despesas-loja");

    return { success: true, message: "Despesa excluída com sucesso!" };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao excluir despesa.",
    };
  }
}

// Update expense schema & action

const updateExpenseSchema = z.object({
  id: z.number(),
  description: z.string().min(1, { message: "Descrição obrigatória" })
    .optional(),
  value: z.string().optional(),
  date: z.string().optional(),
  type: z.enum(["one_time", "installment", "recurring"]).optional(),
  source: z.enum(["personal", "store", "product_purchase"]).optional(),
  isPaid: z.boolean().optional(),
  parentId: z.number().optional(),
  recurrenceType: z.enum(["weekly", "monthly", "yearly", "custom_days"])
    .optional(),
  recurrenceInterval: z.coerce.number().optional(),
  recurrenceEndDate: z.string().optional(),
  installmentNumber: z.number().optional(),
  totalInstallments: z.number().optional(),
  groupId: z.string().uuid().optional(),
  installmentId: z.string().uuid().optional(),
});

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

// Now supports passing an installmentId to link multiple expenses as a group of installments.

// Toggle isPaid for any expense
export async function actionToggleExpenseIsPaid(
  id: number,
  isPaid: boolean,
  date: string,
) {
  try {
    // First, get the expense to check if it's a recurring expense
    const expense = await getExpenseById(id);
    
    if (!expense) {
      return {
        success: false,
        message: "Despesa não encontrada.",
      };
    }

    console.log('expense type: ', expense.type);
    console.log("expense isPaid: ", expense.isPaid);
    console.log("expense originalRecurringExpenseId: ", expense.originalRecurringExpenseId);
    console.log("expense date: ", expense.date);

    if (expense.type === 'recurring') {
      if (isPaid) {
        // For recurring expenses being marked as PAID, create a new one-time expense for the paid occurrence
        const { 
          id: _id, 
          ...expenseData 
        } = expense;
        
        const paidDate = date ?? new Date().toISOString().split('T')[0];
        
        const description = expenseData.description ? String(expenseData.description) : 'Recurring payment';
        const value = expenseData.value ? String(expenseData.value) : '0';
        const source = expenseData.source ?? 'personal';
        
        const paidExpense: ExpenseInsert = {
          description,
          value,
          date: paidDate,
          type: 'one_time',
          source: source,
          isPaid: true,
          originalRecurringExpenseId: expense.id,
          ...(expenseData.installmentNumber !== undefined && { 
            installmentNumber: Number(expenseData.installmentNumber) || 0
          }),
          ...(expenseData.totalInstallments !== undefined && { 
            totalInstallments: Number(expenseData.totalInstallments) || 0
          }),
          ...(expenseData.groupId && { groupId: String(expenseData.groupId) }),
        };
        
        await addExpense(paidExpense);
      }
    }

    if (expense.type === 'one_time' && expense.originalRecurringExpenseId !== undefined && isPaid === false) {
        // For recurring expenses being marked as UNPAID, find and delete the corresponding one-time record
        if (date) { // Date is crucial to find the specific instance
          if (id) { 
            await dbDeleteExpense(id);
          } else {
            console.warn(`One-time occurrence not found for recurring expense ${expense.id} on date ${date} to delete, or it has no ID.`);
          }
        } else {
          console.error(`Date not provided for unchecking recurring expense ${expense.id}. Cannot delete specific occurrence.`);
          // Potentially return an error to the client or just don't do anything
          return {
            success: false,
            message: "Data da ocorrência não fornecida para desmarcar despesa recorrente.",
          };
        }
    }

    if (expense.type !== 'recurring') {
      await updateExpense(id, { isPaid });
    }

    revalidatePath("/compras-produtos");
    revalidatePath("/despesas-pessoais");
    revalidatePath("/despesas-loja");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao atualizar despesa.",
    };
  }
}
