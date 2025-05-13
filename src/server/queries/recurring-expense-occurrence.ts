import { db } from "../db/";
import { recurringExpenseOccurrence } from "../db/schema/recurring-expense-occurrence";
import type { RecurringExpenseOccurrenceInsert } from "../db/schema/recurring-expense-occurrence";
import { and, eq, gte, lte } from "drizzle-orm";

export async function createRecurringExpenseOccurrence(
  data: RecurringExpenseOccurrenceInsert,
) {
  return db.insert(recurringExpenseOccurrence).values(data);
}

export async function getRecurringExpenseOccurrencesForPeriod({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  if (!startDate || !endDate) return [];
  return db
    .select()
    .from(recurringExpenseOccurrence)
    .where(
      and(
        gte(recurringExpenseOccurrence.dueDate, startDate),
        lte(recurringExpenseOccurrence.dueDate, endDate),
      ),
    );
}

export async function updateRecurringExpenseOccurrenceValue({
  id,
  value,
}: {
  id: number;
  value: string;
}) {
  return db
    .update(recurringExpenseOccurrence)
    .set({ value })
    .where(eq(recurringExpenseOccurrence.id, id));
}
