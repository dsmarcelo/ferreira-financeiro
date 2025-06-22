"use server";

import { db } from "@/server/db";
import { cashRegister } from "@/server/db/schema/cash-register";
import { and, gte, lte, sum } from "drizzle-orm";
import { getExpensesByPeriod } from "./expense-queries";
import { type ExpenseSource } from "../db/schema/expense-schema";
import { sumIncomesByDateRange, sumProfitAmountsByDateRange } from "./income-queries";

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
  const result = await getExpensesByPeriod({
    start: startDate,
    end: endDate,
    source,
  });
  const sum = result.reduce((acc, item) => acc + Number(item.value), 0);
  return sum;
}

// Calculate profit using income data (profit amounts from income - personal expenses + store expenses)
export async function getProfit(startDate: string, endDate: string) {
  const [profitAmounts, personalExpensesSum, storeExpensesSum] = await Promise.all([
    sumProfitAmountsByDateRange(startDate, endDate),
    sumExpensesByDateRangeWithSource({
      startDate,
      endDate,
      source: "personal",
    }),
    sumExpensesByDateRangeWithSource({
      startDate,
      endDate,
      source: "store",
    }),
  ]);

  const totalExpenses = personalExpensesSum + storeExpensesSum;
  const profit = profitAmounts - totalExpenses;

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
