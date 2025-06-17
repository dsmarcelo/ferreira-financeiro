"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} from "@/server/queries/expense-category-queries";
import { redirect } from "next/navigation";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
  emoji: z.string().min(1, "Emoji é obrigatório"),
});

export type ActionResponse = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
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

    // Create the category
    await createExpenseCategory(validatedData.data);
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      message: "Erro inesperado ao criar categoria",
    };
  }
  revalidatePath("/categorias");
  redirect("/categorias"); // TODO: Check if this works
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

    // Update the category
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

export async function removeCategoryAction(id: number): Promise<ActionResponse> {
  try {
    await deleteExpenseCategory(id);
    revalidatePath("/categorias");
    return {
      success: true,
      message: "Categoria removida com sucesso",
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      message: "Erro ao remover categoria",
    };
  }
}