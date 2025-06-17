'use server'
import { db } from '@/server/db'
import { expenseCategory } from '@/server/db/schema/expense-category'
import { eq } from 'drizzle-orm'
import type { ExpenseCategoryInsert } from '@/server/db/schema/expense-category'

/**
 * Create a new expense category
 */
export async function createExpenseCategory(data: ExpenseCategoryInsert) {
  const [category] = await db.insert(expenseCategory).values(data).returning();
  return category;
}

/**
 * Get all expense categories
 */
export async function getAllExpenseCategories() {
  return await db.select().from(expenseCategory);
}

/**
 * Get a single expense category by ID
 */
export async function getExpenseCategoryById(id: number) {
  const [category] = await db
    .select()
    .from(expenseCategory)
    .where(eq(expenseCategory.id, id));
  return category;
}

/**
 * Update an expense category
 */
export async function updateExpenseCategory(id: number, data: Partial<ExpenseCategoryInsert>) {
  const [category] = await db
    .update(expenseCategory)
    .set(data)
    .where(eq(expenseCategory.id, id))
    .returning();
  return category;
}

/**
 * Delete an expense category
 */
export async function deleteExpenseCategory(id: number) {
  const [category] = await db
    .delete(expenseCategory)
    .where(eq(expenseCategory.id, id))
    .returning();
  return category;
}
