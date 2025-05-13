import { db } from "../db";
import { recurringExpense } from "../db/schema/recurring-expense";
import type { RecurringExpenseInsert } from "../db/schema/recurring-expense";

import { recurringExpenseOccurrence } from "../db/schema/recurring-expense-occurrence";
import type { RecurringExpenseOccurrenceInsert } from "../db/schema/recurring-expense-occurrence";
import { and, eq, gte, lte, or } from "drizzle-orm";

/**
 * Create recurring expense and generate occurrences for each period from startDate to (endDate or today+12 months).
 */
export async function createRecurringExpense(data: RecurringExpenseInsert) {
  try {
    const [recExp] = await db
      .insert(recurringExpense)
      .values({
        description: data.description,
        value: data.value,
        recurrenceType: data.recurrenceType,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        isActive: true,
      })
      .returning();

    if (!recExp?.id) {
      throw new Error("Recurring expense not created");
    }

    // If startDate is today or a previous day, generate all occurrences up to today and insert them
    const today = new Date();
    const startDate = new Date(data.startDate);
    if (startDate <= today) {
      // Import generateOccurrences from the same file if not already imported
      const occurrences = generateOccurrences({
        recurringExpenseId: recExp.id,
        value: data.value,
        startDate: data.startDate,
        endDate: today.toISOString().slice(0, 10),
        recurrenceType: data.recurrenceType,
      });
      if (occurrences.length > 0) {
        await db.insert(recurringExpenseOccurrence).values(occurrences);
      }
    }
    return recExp;
  } catch (error) {
    console.error("Error in createRecurringExpense:", error);
    throw error;
  }
}

/**
 * List all recurring expense occurrences for a given period, for use in the expenses list.
 * Returns: id, date, description, value, isPaid, type, source, recurringExpenseId
 */
export async function listRecurringExpenseOccurrencesByPeriod({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  // Find all recurring expenses that could have occurrences in the period
  const recExps = await db
    .select()
    .from(recurringExpense)
    .where(
      and(
        lte(recurringExpense.startDate, end),
        or(
          eq(recurringExpense.endDate, null),
          gte(recurringExpense.endDate, start),
        ),
      ),
    );
  // For each recurring expense, generate occurrences for the period
  const occurrences = recExps.flatMap((rec) => {
    const occurrencesForRec = generateOccurrences({
      recurringExpenseId: rec.id,
      value: rec.value,
      startDate: rec.startDate > start ? rec.startDate : start,
      endDate: rec.endDate && rec.endDate < end ? rec.endDate : end,
      recurrenceType: rec.recurrenceType,
    });
    // Filter to only those in the requested window
    return occurrencesForRec
      .filter((occ) => occ.dueDate >= start && occ.dueDate <= end)
      .map((occ) => ({
        id: `recurring-${rec.id}-${occ.dueDate}`,
        date: occ.dueDate,
        description: rec.description,
        value: occ.value,
        isPaid: occ.isPaid,
        type: "recurring",
        source: "recurring",
        recurringExpenseId: rec.id,
      }));
  });
  return occurrences;
}

/**
 * Generate occurrences for a recurring expense (monthly, weekly, yearly).
 * Only for the period between startDate and endDate (or up to 12 months ahead if indefinite).
 */
function generateOccurrences({
  recurringExpenseId,
  value,
  startDate,
  endDate,
  recurrenceType,
}: {
  recurringExpenseId: number;
  value: string;
  startDate: string;
  endDate?: string | null;
  recurrenceType: string;
}): RecurringExpenseOccurrenceInsert[] {
  const occurrences: RecurringExpenseOccurrenceInsert[] = [];
  const current = new Date(startDate);
  const today = new Date();
  const last = endDate
    ? new Date(endDate)
    : new Date(today.getFullYear(), today.getMonth() + 12, today.getDate());
  while (current <= last) {
    occurrences.push({
      recurringExpenseId,
      dueDate: current.toISOString().slice(0, 10),
      value,
      isPaid: false,
    });
    if (recurrenceType === "monthly") {
      current.setMonth(current.getMonth() + 1);
    } else if (recurrenceType === "weekly") {
      current.setDate(current.getDate() + 7);
    } else if (recurrenceType === "yearly") {
      current.setFullYear(current.getFullYear() + 1);
    } else {
      break;
    }
  }
  return occurrences;
}
