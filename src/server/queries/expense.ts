"use server";
import { db } from "../db";
import {
  expense,
  recurrenceRule,
  type ExpenseSource,
  type ExpenseInsert,
  type RecurrenceRuleInsert,
  type RecurrenceRule,
  type Expense,
} from "../db/schema/expense";
import { eq, and, gte, lte } from "drizzle-orm";

export async function addExpense(data: ExpenseInsert) {
  return db.insert(expense).values(data).returning();
}

export async function addRecurrenceRule(data: RecurrenceRuleInsert) {
  return db.insert(recurrenceRule).values(data).returning();
}

export async function getExpensesByPeriod({
  start,
  end,
  source,
}: {
  start: string;
  end: string;
  source?: ExpenseSource;
}): Promise<Expense[] | undefined> {
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
  return undefined;
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

export async function getRecurrenceRuleById(
  id: string,
): Promise<RecurrenceRule | undefined> {
  return db.query.recurrenceRule.findFirst({
    where: eq(recurrenceRule.id, id),
  });
}
