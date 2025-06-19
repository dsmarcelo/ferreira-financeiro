'use server'
import { db } from '@/server/db'
import { expenseCategory } from '@/server/db/schema/expense-category'
import { eq, asc } from 'drizzle-orm'
import type { ExpenseCategoryInsert } from '@/server/db/schema/expense-category'

/**
 * Create a new expense category
 */
export async function createExpenseCategory(data: ExpenseCategoryInsert) {
  const [category] = await db.insert(expenseCategory).values(data).returning();
  return category;
}

/**
 * Get all expense categories ordered by sortOrder, then by name
 */
export async function getAllExpenseCategories() {
  return await db
    .select()
    .from(expenseCategory)
    .orderBy(asc(expenseCategory.sortOrder), asc(expenseCategory.name));
}

/**
 * Get the default expense category (first category by sort order, or category with ID 1)
 */
export async function getDefaultExpenseCategory() {
  // First try to get the category with the lowest sort order
  const [category] = await db
    .select()
    .from(expenseCategory)
    .orderBy(asc(expenseCategory.sortOrder), asc(expenseCategory.name))
    .limit(1);

  return category;
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
 * Update category sort orders
 */
export async function updateCategorySortOrders(updates: { id: number; sortOrder: number }[]) {
  const results = [];
  for (const update of updates) {
    const [category] = await db
      .update(expenseCategory)
      .set({ sortOrder: update.sortOrder })
      .where(eq(expenseCategory.id, update.id))
      .returning();
    results.push(category);
  }
  return results;
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
