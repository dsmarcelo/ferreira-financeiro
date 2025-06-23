"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  getAllExpenseCategories,
} from "@/server/queries/expense-category-queries";
import { redirect } from "next/navigation";
import type { ExpenseCategory } from "@/server/db/schema/expense-category";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
  emoji: z.string().min(1, "Emoji é obrigatório"),
  sortOrder: z.coerce.number().min(0, "Ordem deve ser um número positivo").default(0),
});

export type ActionResponse = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  category?: ExpenseCategory;
};

export async function createCategory(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      color: formData.get("color") as string,
      emoji: formData.get("emoji") as string,
      sortOrder: formData.get("sortOrder") as string,
    };

    // Validate the form data
    const validatedData = categorySchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        success: false,
        message: "Por favor, corrija os erros no formulário",
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    await createExpenseCategory(validatedData.data);
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      message: "Erro inesperado ao criar categoria",
    };
  }
  revalidatePath("/categorias");
  redirect("/categorias");
}

export async function updateCategory(
  id: number,
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      color: formData.get("color") as string,
      emoji: formData.get("emoji") as string,
      sortOrder: formData.get("sortOrder") as string,
    };

    // Validate the form data
    const validatedData = categorySchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        success: false,
        message: "Por favor, corrija os erros no formulário",
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    // Never update isDefault from the form
    await updateExpenseCategory(id, validatedData.data);
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      message: "Erro inesperado ao atualizar categoria",
    };
  }
  revalidatePath("/categorias");
  redirect("/categorias");
}

export async function removeCategoryAction(id: number) {
  try {
    await deleteExpenseCategory(id);
    revalidatePath("/categorias");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, message: "Erro ao deletar categoria" };
  }
}

export async function createCategoryWithoutRedirect(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse & { category?: ExpenseCategory }> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      color: formData.get("color") as string,
      emoji: formData.get("emoji") as string,
      sortOrder: formData.get("sortOrder") as string,
    };

    // Validate the form data
    const validatedData = categorySchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        success: false,
        message: "Por favor, corrija os erros no formulário",
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    const category = await createExpenseCategory(validatedData.data);

    return {
      success: true,
      message: "Categoria criada com sucesso!",
      category,
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      message: "Erro inesperado ao criar categoria",
    };
  }
}