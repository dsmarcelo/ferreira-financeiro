import { db } from "@/server/db";
import { personalExpense } from "@/server/db/schema/personal-expense";
import type {
  PersonalExpense,
  PersonalExpenseInsert,
} from "@/server/db/schema/personal-expense";
import { eq, and, gte, lte, sum } from "drizzle-orm";

// Create a new personal expense entry
export async function createPersonalExpense(
  data: PersonalExpenseInsert,
): Promise<PersonalExpense> {
  const [created] = await db.insert(personalExpense).values(data).returning();
  if (!created) throw new Error("Falha ao criar a despesa pessoal.");
  return created;
}

// Get a personal expense by ID
export async function getPersonalExpenseById(
  id: string,
): Promise<PersonalExpense | undefined> {
  const [entry] = await db
    .select()
    .from(personalExpense)
    .where(eq(personalExpense.id, id));
  return entry;
}

// Update a personal expense by ID
export async function updatePersonalExpense(
  id: string,
  data: Partial<PersonalExpenseInsert>,
): Promise<PersonalExpense | undefined> {
  const [updated] = await db
    .update(personalExpense)
    .set(data)
    .where(eq(personalExpense.id, id))
    .returning();
  return updated;
}

// Delete a personal expense by ID
export async function deletePersonalExpense(id: string): Promise<void> {
  await db.delete(personalExpense).where(eq(personalExpense.id, id));
}

// List all personal expenses (by date range)
export async function listPersonalExpenses(
  startDate: string,
  endDate: string,
): Promise<PersonalExpense[] | []> {
  console.log("fetching personal expenses", startDate, endDate);
  if (startDate && endDate) {
    return db
      .select()
      .from(personalExpense)
      .where(
        and(
          gte(personalExpense.dueDate, startDate),
          lte(personalExpense.dueDate, endDate),
        ),
      );
  }
  return [];
}

// Get the sum of values in a date range
export async function sumPersonalExpenseByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  const result = await db
    .select({ sum: sum(personalExpense.value) })
    .from(personalExpense)
    .where(
      and(
        gte(personalExpense.dueDate, startDate),
        lte(personalExpense.dueDate, endDate),
      ),
    );
  return Number(result[0]?.sum ?? 0);
}
