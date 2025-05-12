import { db } from "../db/";
import { recurringExpense } from "../db/schema/recurring-expense";
import type { RecurringExpenseInsert } from "../db/schema/recurring-expense";

export async function createRecurringExpense(data: RecurringExpenseInsert) {
  return db.insert(recurringExpense).values({
    description: data.description,
    value: data.value,
    recurrenceType: data.recurrenceType,
    startDate: data.startDate,
    endDate: data.endDate ?? null,
    isActive: true,
  });
}
