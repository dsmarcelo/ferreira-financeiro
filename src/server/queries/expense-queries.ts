"use server";
import { db } from "../db";
import {
  type Expense,
  expense,
  type ExpenseInsert,
  type ExpenseSource,
} from "../db/schema/expense-schema";
import { and, eq, gte, isNull, lte, ne, or, type SQL, sum } from "drizzle-orm";
import { expenseCategory, DEFAULT_CATEGORY } from "../db/schema/expense-category";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format as formatDateFn,
  isAfter,
  isBefore,
  min as minDate,
  parseISO,
} from "date-fns";

type JoinedExpense = {
  expense: typeof expense.$inferSelect;
  expense_category: typeof expenseCategory.$inferSelect | null;
};

function mapJoinedExpenseToExpense(joinedExpense: JoinedExpense): Expense {
  if (!joinedExpense.expense) throw new Error("Invalid expense data");
  return {
    ...joinedExpense.expense,
    category: joinedExpense.expense_category ?? DEFAULT_CATEGORY,
  };
}

export async function addExpense(data: ExpenseInsert): Promise<Expense> {
  // Set default category if none provided
  data.categoryId ??= DEFAULT_CATEGORY.id;
  const [newExpense] = await db.insert(expense).values(data).returning();
  if (!newExpense) throw new Error("Failed to create expense");

  const [category] = await db
    .select()
    .from(expenseCategory)
    .where(eq(expenseCategory.id, newExpense.categoryId!));
  if (!category) throw new Error("Category not found");

  return { ...newExpense, category };
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
  const baseConditions = [];
  if (source) {
    baseConditions.push(eq(expense.source, source));
  }

  const queryStartDateString = start;
  const queryEndDateString = end;

  if (queryStartDateString && queryEndDateString) {
    baseConditions.push(
      or(
        and(
          ne(expense.type, "recurring"),
          gte(expense.date, queryStartDateString),
          lte(expense.date, queryEndDateString),
        ),
        and(
          eq(expense.type, "recurring"),
          lte(expense.date, queryEndDateString),
          or(
            isNull(expense.recurrenceEndDate),
            gte(expense.recurrenceEndDate, queryStartDateString),
          ),
        ),
      ),
    );
  } else if (queryStartDateString) {
    baseConditions.push(
      or(
        and(
          ne(expense.type, "recurring"),
          gte(expense.date, queryStartDateString),
        ),
        and(
          eq(expense.type, "recurring"),
          or(
            isNull(expense.recurrenceEndDate),
            gte(expense.recurrenceEndDate, queryStartDateString),
          ),
        ),
      ),
    );
  } else if (queryEndDateString) {
    baseConditions.push(
      or(
        and(
          ne(expense.type, "recurring"),
          lte(expense.date, queryEndDateString),
        ),
        and(
          eq(expense.type, "recurring"),
          lte(expense.date, queryEndDateString),
        ),
      ),
    );
  }

  const initialExpenses = await (() => {
    const currentBaseSelect = db
      .select()
      .from(expense)
      .leftJoin(expenseCategory, eq(expense.categoryId, expenseCategory.id));

    if (baseConditions.length > 0) {
      const validBaseConditions = baseConditions.filter(
        (condition): condition is SQL<unknown> => !!condition,
      );
      if (validBaseConditions.length > 0) {
        return currentBaseSelect.where(and(...validBaseConditions));
      }
    }
    return currentBaseSelect;
  })();

  const processedExpenses: Expense[] = [];

  const queryStartDate = queryStartDateString
    ? parseISO(queryStartDateString)
    : null;
  const queryEndDate = queryEndDateString ? parseISO(queryEndDateString) : null;

  function getRecurringExpenses(
    ex: Expense,
    queryStartDate: Date,
    queryEndDate: Date,
  ): Expense[] {
    const processed: Expense[] = [];
    let currentRecurrenceDate = parseISO(ex.date);
    const seriesActualEndDate = ex.recurrenceEndDate
      ? minDate([queryEndDate, parseISO(ex.recurrenceEndDate)])
      : queryEndDate;

    while (!isAfter(currentRecurrenceDate, seriesActualEndDate)) {
      if (!isBefore(currentRecurrenceDate, queryStartDate)) {
        processed.push({
          ...ex,
          date: formatDateFn(currentRecurrenceDate, "yyyy-MM-dd"),
        });
      }
      let nextDateAdvanced = false;
      switch (ex.recurrenceType) {
        case "weekly":
          currentRecurrenceDate = addWeeks(currentRecurrenceDate, 1);
          nextDateAdvanced = true;
          break;
        case "monthly":
          currentRecurrenceDate = addMonths(currentRecurrenceDate, 1);
          nextDateAdvanced = true;
          break;
        case "yearly":
          currentRecurrenceDate = addYears(currentRecurrenceDate, 1);
          nextDateAdvanced = true;
          break;
        case "custom_days":
          if (ex.recurrenceInterval && ex.recurrenceInterval > 0) {
            currentRecurrenceDate = addDays(
              currentRecurrenceDate,
              ex.recurrenceInterval,
            );
            nextDateAdvanced = true;
          } else {
            console.error(
              `Invalid recurrenceInterval for custom_days expense ID: ${ex.id}`,
            );
          }
          break;
        default:
          console.error(`Unknown recurrenceType for expense ID: ${ex.id}`);
          break;
      }
      if (!nextDateAdvanced) break;
    }
    return processed;
  }

  for (const joinedExpense of initialExpenses) {
    const ex = mapJoinedExpenseToExpense(joinedExpense);
    if (ex.type === "recurring" && ex.recurrenceType && queryStartDate && queryEndDate) {
      const paidOccurrences = initialExpenses
        .map(mapJoinedExpenseToExpense)
        .filter(e =>
          e.type === "recurring_occurrence" &&
          e.originalRecurringExpenseId === ex.id &&
          e.isPaid
        );
      const occurrences = getRecurringExpenses(ex, queryStartDate, queryEndDate);
      for (const occurrence of occurrences) {
        const matchingPaid = paidOccurrences.find(o => o.date === occurrence.date);
        if (matchingPaid) {
          processedExpenses.push(matchingPaid);
        } else {
          processedExpenses.push(occurrence);
        }
      }
    } else if (ex.type === "recurring_occurrence" && ex.originalRecurringExpenseId !== null) {
      continue;
    } else {
      processedExpenses.push(ex);
    }
  }

  return processedExpenses.sort((a, b) => {
    const dateComparison = a.date.localeCompare(b.date);
    if (dateComparison !== 0) return dateComparison;
    return (a.id ?? 0) - (b.id ?? 0);
  });
}

export async function updateExpense(
  id: number,
  data: Partial<ExpenseInsert>,
): Promise<Expense | undefined> {
  const dataForUpdate: Partial<ExpenseInsert> = { ...data };

  if (dataForUpdate.recurrenceEndDate === undefined) {
    dataForUpdate.recurrenceEndDate = null;
  }
  if (dataForUpdate.recurrenceInterval === undefined) {
    dataForUpdate.recurrenceInterval = null;
  }
  if (dataForUpdate.recurrenceType === undefined) {
    dataForUpdate.recurrenceType = null;
  }
  if (dataForUpdate.originalRecurringExpenseId === undefined) {
    dataForUpdate.originalRecurringExpenseId = null;
  }

  const [updated] = await db
    .update(expense)
    .set(dataForUpdate)
    .where(eq(expense.id, id))
    .returning();

  if (updated) {
    const [category] = await db
      .select()
      .from(expenseCategory)
      .where(eq(expenseCategory.id, updated.categoryId!));
    if (!category) throw new Error("Category not found");
    return { ...updated, category };
  }
  return undefined;
}

export async function getExpenseById(id: number): Promise<Expense | undefined> {
  const [joinedExpense] = await db
    .select()
    .from(expense)
    .leftJoin(expenseCategory, eq(expense.categoryId, expenseCategory.id))
    .where(eq(expense.id, id));
  return joinedExpense ? mapJoinedExpenseToExpense(joinedExpense) : undefined;
}

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

export async function getOneTimeExpenseByRecurringOriginAndDate(
  originalRecurringExpenseId: number,
  occurrenceDate: string,
): Promise<Expense | undefined> {
  const [joinedExpense] = await db
    .select()
    .from(expense)
    .leftJoin(expenseCategory, eq(expense.categoryId, expenseCategory.id))
    .where(
      and(
        eq(expense.type, "one_time"),
        eq(expense.originalRecurringExpenseId, originalRecurringExpenseId),
        eq(expense.date, occurrenceDate),
      ),
    )
    .limit(1);
  return joinedExpense ? mapJoinedExpenseToExpense(joinedExpense) : undefined;
}

export async function getInstallmentsByGroupId(
  groupId: string,
): Promise<Expense[]> {
  const results = await db
    .select()
    .from(expense)
    .leftJoin(expenseCategory, eq(expense.categoryId, expenseCategory.id))
    .where(and(eq(expense.groupId, groupId), eq(expense.type, "installment")))
    .orderBy(expense.installmentNumber);
  return results.map(mapJoinedExpenseToExpense);
}
