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
}) {
  // Optionally filter by source (personal, store, product_purchase)
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
