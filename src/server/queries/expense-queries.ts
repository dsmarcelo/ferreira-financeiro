"use server";
import { db } from "../db";
import {
  type Expense,
  expense,
  type ExpenseInsert,
  type ExpenseSource,
} from "../db/schema/expense-schema";
import { and, eq, gte, lte } from "drizzle-orm";

export async function addExpense(data: ExpenseInsert) {
  return db.insert(expense).values(data).returning();
}

export async function getExpensesByPeriod({
  start,
  end,
  source,
}: {
  start: string;
  end: string;
  source?: ExpenseSource;
}): Promise<Expense[]> {
  // Optionally filter by source (personal, store, product_purchase)
  if (start && end) {
    return db
      .select()
      .from(expense)
      .where(
        and(
          gte(expense.date, start),
          lte(expense.date, end),
          source ? eq(expense.source, source) : undefined,
        ),
      );
  }
  return [];
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
