import { db } from "../db/";
import { recurringExpenseOccurrence } from "../db/schema/recurring-expense-occurrence";
import type { RecurringExpenseOccurrenceInsert } from "../db/schema/recurring-expense-occurrence";

export async function createRecurringExpenseOccurrence(data: RecurringExpenseOccurrenceInsert) {
  return db.insert(recurringExpenseOccurrence).values(data);
}

export async function getRecurringExpenseOccurrencesForPeriod({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  return db
    .select()
    .from(recurringExpenseOccurrence)
    .where(
      recurringExpenseOccurrence.dueDate.gte(startDate).and(
        recurringExpenseOccurrence.dueDate.lte(endDate)
      )
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
    .where(recurringExpenseOccurrence.id.eq(id));
}
