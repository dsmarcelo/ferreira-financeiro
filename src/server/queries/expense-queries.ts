"use server";
import { db } from "../db";
import {
  type Expense,
  expense,
  type ExpenseInsert,
  type ExpenseSource,
} from "../db/schema/expense-schema";
import { and, eq, gte, lte, or, sum } from "drizzle-orm";

export async function addExpense(data: ExpenseInsert) {
  return db.insert(expense).values(data).returning();
}

export async function getExpensesByPeriod({
  start,
  end,
  source,
}: {
  start?: string;
  end?: string;
  source?: ExpenseSource;
}): Promise<Expense[]> {
  const conditions = [];

  if (source) {
    conditions.push(eq(expense.source, source));
  }
  if (start) {
    conditions.push(gte(expense.date, start));
  }
  if (end) {
    conditions.push(lte(expense.date, end));
  }

  // Filter out any undefined/null values that might have been pushed if logic changes
  const validConditions = conditions.filter(Boolean);

  if (validConditions.length === 0) {
    // If no filters are specified, return all expenses.
    // Consider pagination or default date range in the future for performance.
    return db.select().from(expense);
  }

  return db
    .select()
    .from(expense)
    // Use spread operator for conditions array with drizzle's 'and' helper
    .where(and(...validConditions));
}

// Update a unified expense by ID
export async function updateExpense(
  id: number,
  data: Partial<ExpenseInsert>,
): Promise<Expense | undefined> {
  const [updated] = await db
    .update(expense)
    .set(data)
    .where(eq(expense.id, id))
    .returning();
  return updated;
}

export async function getExpenseById(id: number): Promise<Expense | undefined> {
  return db.query.expense.findFirst({ where: eq(expense.id, id) });
}

// Delete an expense by ID
export async function deleteExpense(id: number): Promise<void> {
  await db.delete(expense).where(eq(expense.id, id));
}

export async function sumExpensesByPeriod({
  start,
  end,
}: {
  start: string;
  end: string;
}): Promise<number> {
  const result = await db
    .select({ sum: sum(expense.value) })
    .from(expense)
    .where(
      and(
        gte(expense.date, start),
        lte(expense.date, end),
        or(eq(expense.source, "store"), eq(expense.source, "personal")),
      ),
    );
  return Number(result?.[0]?.sum ?? 0);
}
