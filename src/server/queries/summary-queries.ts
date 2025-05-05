"use server";

import { db } from "@/server/db";
import { personalExpense } from "@/server/db/schema/personal-expense";
import { storeExpense } from "@/server/db/schema/store-expense";
import { productPurchase } from "@/server/db/schema/product-purchase";
import { and, gte, lte } from "drizzle-orm";

export interface ExpenseSummary {
  dueDate: string;
  description: string;
  value: number;
  isPaid: boolean;
}

/**
 * Fetch all personal expenses and product purchases in the given date range.
 * Returns: dueDate, description, value, isPaid for each entry.
 */
export async function listExpensesAndPurchasesByDateRange(
  startDate: string,
  endDate: string,
): Promise<ExpenseSummary[]> {
  const personal = await db
    .select({
      dueDate: personalExpense.dueDate,
      description: personalExpense.description,
      value: personalExpense.value,
      isPaid: personalExpense.isPaid,
    })
    .from(personalExpense)
    .where(
      and(
        gte(personalExpense.dueDate, startDate),
        lte(personalExpense.dueDate, endDate),
      ),
    );

  const store = await db
    .select({
      dueDate: storeExpense.dueDate,
      description: storeExpense.description,
      value: storeExpense.value,
      isPaid: storeExpense.isPaid,
    })
    .from(storeExpense)
    .where(
      and(
        gte(storeExpense.dueDate, startDate),
        lte(storeExpense.dueDate, endDate),
      ),
    );

  const purchases = await db
    .select({
      dueDate: productPurchase.dueDate,
      description: productPurchase.description,
      value: productPurchase.value,
      isPaid: productPurchase.isPaid,
    })
    .from(productPurchase)
    .where(
      and(
        gte(productPurchase.dueDate, startDate),
        lte(productPurchase.dueDate, endDate),
      ),
    );

  return [...personal, ...store, ...purchases]
    .map((item) => ({
      ...item,
      value: Number(item.value),
    }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
