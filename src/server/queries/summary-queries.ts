"use server";

import { db } from "@/server/db";
import { cashRegister } from "@/server/db/schema/cash-register";
import { and, eq, gte, lte, sum } from "drizzle-orm";
import { getExpensesByPeriod } from "./expense-queries";
import { expense, type ExpenseSource } from "../db/schema/expense-schema";

export async function sumCashRegisterByDateRange(
  startDate: string,
  endDate: string,
) {
  const cashRegisterSum = Number(
    (
      await db
        .select({ sum: sum(cashRegister.value) })
        .from(cashRegister)
        .where(
          and(
            gte(cashRegister.date, startDate),
            lte(cashRegister.date, endDate),
          ),
        )
    )[0]?.sum ?? 0,
  );
  return cashRegisterSum;
}

export async function sumExpensesByDateRangeWithSource({
  startDate,
  endDate,
  source,
}: {
  startDate: string;
  endDate: string;
  source: ExpenseSource;
}): Promise<number> {
  const result = await db
    .select({ sum: sum(expense.value) })
    .from(expense)
    .where(
      and(
        gte(expense.date, startDate),
        lte(expense.date, endDate),
        eq(expense.source, source),
      ),
    );
  return Number(result?.[0]?.sum ?? 0);
}

// Calculate profit with margin
export async function getProfit(startDate: string, endDate: string) {
  const cashRegisterSum = await sumCashRegisterByDateRange(startDate, endDate);
  const personalExpensesSum = await sumExpensesByDateRangeWithSource({
    startDate,
    endDate,
    source: "personal",
  });
  const storeExpensesSum = await sumExpensesByDateRangeWithSource({
    startDate,
    endDate,
    source: "store",
  });
  const profit = cashRegisterSum * 0.28 -
    (personalExpensesSum + storeExpensesSum);
  return profit;
}

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
  const expenses = await getExpensesByPeriod({
    start: startDate,
    end: endDate,
  });

  return expenses
    .map((item) => ({
      ...item,
      value: Number(item.value),
      dueDate: item.date,
    }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
