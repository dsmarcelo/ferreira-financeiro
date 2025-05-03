import { db } from "@/server/db";
import { personalExpense } from "@/server/db/schema/personal-expense";
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
  endDate: string
): Promise<ExpenseSummary[]> {
  const personal = await db
    .select({
      dueDate: personalExpense.date,
      description: personalExpense.description,
      value: personalExpense.value,
      isPaid: personalExpense.isPaid,
    })
    .from(personalExpense)
    .where(
      and(
        gte(personalExpense.date, startDate),
        lte(personalExpense.date, endDate)
      )
    );

  const purchases = await db
    .select({
      dueDate: productPurchase.date,
      description: productPurchase.description,
      value: productPurchase.value,
      isPaid: productPurchase.isPaid,
    })
    .from(productPurchase)
    .where(
      and(
        gte(productPurchase.date, startDate),
        lte(productPurchase.date, endDate)
      )
    );

  return [...personal, ...purchases]
    .map(item => ({
      ...item,
      value: Number(item.value),
    }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
