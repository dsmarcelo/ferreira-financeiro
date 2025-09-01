"use server";

import { revalidatePath } from "next/cache";
import { deleteStock } from "@/server/queries/stock-queries";

export async function actionDeleteStock(id: number): Promise<void> {
  await deleteStock(id);
  revalidatePath("/estoque");
}

