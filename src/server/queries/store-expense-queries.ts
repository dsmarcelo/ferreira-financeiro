import { db } from "../db";
import { storeExpense } from "@/server/db/schema/store-expense";
import type {
  StoreExpense,
  StoreExpenseInsert,
} from "@/server/db/schema/store-expense";
import { eq, and, gte, lte, sum } from "drizzle-orm";

// Create a new store expense entry
export async function createStoreExpense(
  data: StoreExpenseInsert,
): Promise<StoreExpense> {
  const [created] = await db.insert(storeExpense).values(data).returning();
  if (!created) throw new Error("Falha ao criar a despesa da loja.");
  return created;
}

// Get a store expense by ID
export async function getStoreExpenseById(
  id: string,
): Promise<StoreExpense | undefined> {
  const [entry] = await db
    .select()
    .from(storeExpense)
    .where(eq(storeExpense.id, id));
  return entry;
}

// Update a store expense by ID
export async function updateStoreExpense(
  id: string,
  data: Partial<StoreExpenseInsert>,
): Promise<StoreExpense | undefined> {
  const [updated] = await db
    .update(storeExpense)
    .set(data)
    .where(eq(storeExpense.id, id))
    .returning();
  return updated;
}

// Delete a store expense by ID
export async function deleteStoreExpense(id: string): Promise<void> {
  await db.delete(storeExpense).where(eq(storeExpense.id, id));
}

// List all store expenses (optionally by date range)
export async function listStoreExpenses(
  startDate?: string,
  endDate?: string,
): Promise<StoreExpense[]> {
  if (startDate && endDate) {
    return db
      .select()
      .from(storeExpense)
      .where(
        and(gte(storeExpense.date, startDate), lte(storeExpense.date, endDate)),
      );
  }
  return db.select().from(storeExpense);
}

// Get the sum of values in a date range
export async function sumStoreExpenseByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  const result = await db
    .select({ sum: sum(storeExpense.value) })
    .from(storeExpense)
    .where(
      and(gte(storeExpense.date, startDate), lte(storeExpense.date, endDate)),
    );
  return Number(result[0]?.sum ?? 0);
}
