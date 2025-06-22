"use server";

import { db } from "../db";
import { incomes } from "../db/schema/incomes-schema";
import type {
  Income,
  IncomeInsert,
} from "../db/schema/incomes-schema";
import { eq, and, gte, lte, sum, asc } from "drizzle-orm";

// Create a new income entry
export async function createIncome(
  data: IncomeInsert,
): Promise<Income> {
  // Insert a new record and return the inserted row
  const [created] = await db.insert(incomes).values(data).returning();
  if (!created) throw new Error("Falha ao criar a entrada de receita.");
  return created;
}

// Get an income entry by ID
export async function getIncomeById(
  id: number,
): Promise<Income | undefined> {
  // Find a record by its primary key
  const [entry] = await db
    .select()
    .from(incomes)
    .where(eq(incomes.id, id));
  return entry;
}

// Update an income entry by ID
export async function updateIncome(
  id: number,
  data: Partial<IncomeInsert>,
): Promise<Income | undefined> {
  // Update the record and return the updated row
  const [updated] = await db
    .update(incomes)
    .set(data)
    .where(eq(incomes.id, id))
    .returning();
  return updated;
}

// Delete an income entry by ID
export async function deleteIncome(id: number): Promise<void> {
  // Delete the record by its primary key
  await db.delete(incomes).where(eq(incomes.id, id));
}

// List all income entries (by date range)
export async function listIncomes(
  startDate: string,
  endDate: string,
): Promise<Income[] | []> {
  if (startDate && endDate) {
    return db
      .select()
      .from(incomes)
      .where(
        and(gte(incomes.date, startDate), lte(incomes.date, endDate)),
      )
      .orderBy(asc(incomes.date));
  }
  return [];
}

// Get the sum of values in a date range
export async function sumIncomesByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  // Aggregate the sum of the value column for the given date range
  const result = await db
    .select({ sum: sum(incomes.value) })
    .from(incomes)
    .where(
      and(gte(incomes.date, startDate), lte(incomes.date, endDate)),
    );
  // Return the sum or 0 if no records
  return Number(result[0]?.sum ?? 0);
}

// Get the sum of profit margins in a date range
export async function sumProfitMarginsByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  // Aggregate the sum of the profit_margin column for the given date range
  const result = await db
    .select({ sum: sum(incomes.profitMargin) })
    .from(incomes)
    .where(
      and(gte(incomes.date, startDate), lte(incomes.date, endDate)),
    );
  // Return the sum or 0 if no records
  return Number(result[0]?.sum ?? 0);
}

// Get the total profit (sum of values + profit margins) in a date range
export async function sumTotalProfitByDateRange(
  startDate: string,
  endDate: string,
): Promise<{ totalValue: number; totalProfitMargin: number; totalProfit: number }> {
  // Get both sums in parallel
  const [totalValue, totalProfitMargin] = await Promise.all([
    sumIncomesByDateRange(startDate, endDate),
    sumProfitMarginsByDateRange(startDate, endDate),
  ]);

  return {
    totalValue,
    totalProfitMargin,
    totalProfit: totalValue + totalProfitMargin,
  };
}