"use server";

import {
  createCashRegister,
  getCashRegisterById,
  updateCashRegister,
  deleteCashRegister,
  listCashRegisters,
  sumCashRegisterByDateRange,
  createCashRegisterWithItems,
} from "@/server/queries/cash-register-queries";
import { revalidatePath } from "next/cache";
import type { CashRegisterInsert } from "@/server/db/schema/cash-register-schema";
import { z } from "zod";

const cashRegisterInsertSchema = z.object({
  date: z.string({ message: "Data inválida" }),
  totalValue: z.number().min(0, { message: "Valor inválido" }).optional(),
  extraValue: z.number().min(0).optional(),
  soldItemsJson: z.string().optional(),
});

// Define a common ActionResponse interface for form actions

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof CashRegisterInsert]?: string[];
  };
}

// Server action to create a cash register entry
export async function actionCreateCashRegister(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  // Parse form data
  const date = formData.get("date");
  const totalValueStr = formData.get("totalValue");
  const extraValueStr = formData.get("extraValue");
  const soldItemsJson = formData.get("soldItemsJson");
  const totalValue =
    typeof totalValueStr === "string" && totalValueStr.length > 0
      ? Number(totalValueStr)
      : undefined;
  const extraValue =
    typeof extraValueStr === "string" && extraValueStr.length > 0
      ? Number(extraValueStr)
      : 0;

  // Validate using Zod, passing raw values
  const result = cashRegisterInsertSchema.safeParse({
    date,
    totalValue,
    extraValue,
    soldItemsJson,
  });
  if (!result.success) {
    // Return field-level errors and a general message
    return {
      success: false,
      message: "Por favor, corrija os erros no formulário.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const items: Array<{ productId: number; quantity: number; unitPrice: string }> = [];
    if (typeof soldItemsJson === "string" && soldItemsJson.trim().length > 0) {
      try {
        const parsed = JSON.parse(soldItemsJson) as Array<{
          productId: number;
          quantity: number;
          unitPrice: number;
        }>;
        for (const it of parsed) {
          if (
            typeof it.productId === "number" &&
            typeof it.quantity === "number" &&
            it.quantity > 0
          ) {
            const unitPrice =
              typeof it.unitPrice === "number" ? it.unitPrice.toFixed(2) : "0.00";
            items.push({ productId: it.productId, quantity: it.quantity, unitPrice });
          }
        }
      } catch {
        // ignore json errors
      }
    }

    if (items.length > 0) {
      const itemsTotal = items.reduce(
        (sum, it) => sum + Number(it.unitPrice) * it.quantity,
        0,
      );
      const finalTotal = itemsTotal + (extraValue ?? 0);
      await createCashRegisterWithItems(
        {
          date: date as string,
          value: finalTotal.toFixed(2),
          profit: (extraValue ?? 0).toFixed(2),
        },
        items,
      );
    } else {
      const finalTotal = (totalValue ?? 0) + (extraValue ?? 0);
      await createCashRegister({
        date: date as string,
        value: finalTotal.toFixed(2),
        profit: (extraValue ?? 0).toFixed(2),
      });
    }
    revalidatePath("/caixa");
    return { success: true, message: "Caixa adicionado com sucesso!" };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao adicionar caixa.",
    };
  }
}

// Server action to update a cash register entry
export async function actionUpdateCashRegister(
  _prevState: ActionResponse | undefined,
  formData: FormData,
): Promise<ActionResponse> {
  const id = Number(formData.get("id"));
  if (!id || isNaN(id)) {
    return { success: false, message: "ID inválido" };
  }
  const date = formData.get("date");
  const totalValueStr = formData.get("totalValue");
  const extraValueStr = formData.get("extraValue");
  const totalValue =
    typeof totalValueStr === "string" && totalValueStr.length > 0
      ? Number(totalValueStr)
      : undefined;
  const extraValue =
    typeof extraValueStr === "string" && extraValueStr.length > 0
      ? Number(extraValueStr)
      : 0;

  // Validate using Zod, passing raw values
  const result = cashRegisterInsertSchema.safeParse({
    date,
    totalValue,
    extraValue,
  });
  if (!result.success) {
    return {
      success: false,
      message: "Por favor, corrija os erros no formulário.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const finalTotal = (totalValue ?? 0) + (extraValue ?? 0);
    await updateCashRegister(id, {
      date: date as string,
      value: finalTotal.toFixed(2),
      profit: (extraValue ?? 0).toFixed(2),
    });
    revalidatePath("/caixa");
    return { success: true, message: "Caixa atualizado com sucesso!" };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message ?? "Erro ao atualizar caixa.",
    };
  }
}

// Server action to delete a cash register entry
export async function actionDeleteCashRegister(id: number) {
  await deleteCashRegister(id);
  revalidatePath("/caixa");
}

// Server action to get a cash register entry by ID
export async function actionGetCashRegisterById(id: number) {
  return getCashRegisterById(id);
}

// Server action to list cash register entries (optionally by date range)
export async function actionListCashRegisters(
  startDate: string,
  endDate: string,
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
