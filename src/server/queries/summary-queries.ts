"use server";

import { db } from "@/server/db";
import { incomes } from "@/server/db/schema/incomes-schema";
import { sales } from "@/server/db/schema/sales-schema";
import { and, gte, lte, sum } from "drizzle-orm";
import { getExpensesByPeriod } from "./expense-queries";
import { type ExpenseSource } from "../db/schema/expense-schema";
import { sumProfitAmountsByDateRange } from "./income-queries";

export async function sumCashRegisterByDateRange(
  startDate: string,
  endDate: string,
) {
  const cashRegisterSum = Number(
    (
      await db
        .select({ sum: sum(incomes.value) })
        .from(incomes)
        .where(
          and(
            gte(incomes.dateTime, new Date(startDate)),
            lte(incomes.dateTime, new Date(endDate)),
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

/**
 * Return combined daily income totals within the range by summing values from incomes and sales.
 * Output date keys are in ISO yyyy-MM-dd.
 */
export async function listDailyCombinedIncomeByDateRange(
  startDate: string,
  endDate: string,
): Promise<Array<{ date: string; total: number }>> {
  if (!startDate || !endDate) return [];

  const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
  const endDateTime = new Date(`${endDate}T23:59:59.999Z`);

  const [incomeRows, salesRows] = await Promise.all([
    db
      .select({ value: incomes.value, dateTime: incomes.dateTime })
      .from(incomes)
      .where(and(gte(incomes.dateTime, startDateTime), lte(incomes.dateTime, endDateTime))),
    db
      .select({ value: sales.value, dateTime: sales.dateTime })
      .from(sales)
      .where(and(gte(sales.dateTime, startDateTime), lte(sales.dateTime, endDateTime))),
  ]);

  const toKey = (d: Date) => {
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const totals = new Map<string, number>();

  for (const row of incomeRows) {
    const dt = new Date(row.dateTime as unknown as Date);
    const key = toKey(dt);
    const val = Number(row.value) || 0;
    totals.set(key, (totals.get(key) ?? 0) + val);
  }

  for (const row of salesRows) {
    const dt = new Date(row.dateTime as unknown as Date);
    const key = toKey(dt);
    const val = Number(row.value) || 0;
    totals.set(key, (totals.get(key) ?? 0) + val);
  }

  return Array.from(totals.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Sum of combined incomes + sales across the whole range */
export async function sumCombinedIncomeByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  const rows = await listDailyCombinedIncomeByDateRange(startDate, endDate);
  return rows.reduce((acc, r) => acc + r.total, 0);
}
