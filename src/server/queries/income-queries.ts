"use server";

import { db } from "../db";
import { incomes } from "../db/schema/incomes-schema";
import { products } from "../db/schema/products";
import { incomeItem } from "../db/schema/income-items";
import type {
  Income,
  IncomeInsert,
} from "../db/schema/incomes-schema";
import { eq, and, gte, lte, sum, asc } from "drizzle-orm";

// Create a new income entry
export async function createIncome(
  data: IncomeInsert,
): Promise<Income> {
  // Insert a new record and return the inserted row
  const [created] = await db.insert(incomes).values(data).returning();
  if (!created) throw new Error("Falha ao criar a entrada de receita.");
  return created;
}

// Get an income entry by ID
export async function getIncomeById(
  id: number,
): Promise<Income | undefined> {
  // Find a record by its primary key
  const [entry] = await db
    .select()
    .from(incomes)
    .where(eq(incomes.id, id));
  return entry;
}

// Update an income entry by ID
export async function updateIncome(
  id: number,
  data: Partial<IncomeInsert>,
): Promise<Income | undefined> {
  // Update the record and return the updated row
  const [updated] = await db
    .update(incomes)
    .set(data)
    .where(eq(incomes.id, id))
    .returning();
  return updated;
}

// Delete an income entry by ID
export async function deleteIncome(id: number): Promise<void> {
  // Delete related items and the income in a single transaction
  await db.transaction(async (tx) => {
    await tx.delete(incomeItem).where(eq(incomeItem.incomeId, id));
    await tx.delete(incomes).where(eq(incomes.id, id));
  });
}

// List all income entries (by date range)
export async function listIncomes(
  startDate: string,
  endDate: string,
): Promise<Income[] | []> {
  if (startDate && endDate) {
    // Convert date strings to full datetime ranges
    const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
    const endDateTime = new Date(`${endDate}T23:59:59.999Z`);

    return db
      .select()
      .from(incomes)
      .where(
        and(gte(incomes.dateTime, startDateTime), lte(incomes.dateTime, endDateTime)),
      )
      .orderBy(asc(incomes.dateTime));
  }
  return [];
}

// Get the sum of values in a date range
export async function sumIncomesByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  // Convert date strings to full datetime ranges
  const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
  const endDateTime = new Date(`${endDate}T23:59:59.999Z`);

  // Aggregate the sum of the value column for the given date range
  const result = await db
    .select({ sum: sum(incomes.value) })
    .from(incomes)
    .where(
      and(gte(incomes.dateTime, startDateTime), lte(incomes.dateTime, endDateTime)),
    );
  // Return the sum or 0 if no records
  return Number(result[0]?.sum ?? 0);
}

// Get the sum of profit amounts (calculated from totalIncome * profitMargin%) in a date range
export async function sumProfitAmountsByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  // Get all income records to calculate profit amounts
  const incomeRecords = await listIncomes(startDate, endDate);

  // Calculate total profit amount from totalIncome * (profitMargin / 100)
  const totalProfitAmount = incomeRecords.reduce((sum, income) => {
    const totalIncome = Number(income.value); // This is the total income input by user
    const profitMarginPercent = Number(income.profitMargin);
    const profitAmount = totalIncome * (profitMarginPercent / 100);
    return sum + profitAmount;
  }, 0);

  return totalProfitAmount;
}

// Get the total profit breakdown (base value, profit amounts, and total income) in a date range
export async function sumTotalProfitByDateRange(
  startDate: string,
  endDate: string,
): Promise<{ totalIncome: number; totalProfitAmount: number; totalBaseValue: number }> {
  // Get all income records to calculate detailed breakdown
  const incomeRecords = await listIncomes(startDate, endDate);

  const totals = incomeRecords.reduce((acc, income) => {
    const totalIncome = Number(income.value); // This is the total income input by user
    const profitMarginPercent = Number(income.profitMargin);
    const profitAmount = totalIncome * (profitMarginPercent / 100);
    const baseValue = totalIncome - profitAmount;

    return {
      totalIncome: acc.totalIncome + totalIncome,
      totalProfitAmount: acc.totalProfitAmount + profitAmount,
      totalBaseValue: acc.totalBaseValue + baseValue,
    };
  }, { totalIncome: 0, totalProfitAmount: 0, totalBaseValue: 0 });

  return totals;
}

// Create income and decrement stock atomically
export async function createIncomeAndDecrementStock(
  data: IncomeInsert,
  items: Array<{ productId: number; quantity: number }>,
): Promise<Income> {
  return db.transaction(async (tx) => {
    // Decrement stock
    for (const item of items) {
      const [row] = await tx.select().from(products).where(eq(products.id, item.productId));
      if (!row) throw new Error("Produto não encontrado");
      const newQty = (row.quantity ?? 0) - item.quantity;
      if (newQty < 0) {
        throw new Error(
          `Estoque insuficiente para o produto "${row.name}". Disponível: ${row.quantity}, solicitado: ${item.quantity}`,
        );
      }
      await tx.update(products).set({ quantity: newQty }).where(eq(products.id, item.productId));
    }

    const [created] = await tx.insert(incomes).values(data).returning();
    if (!created) throw new Error("Falha ao criar a entrada de receita.");
    // Optionally record items when provided with price
    // For existing callers, unitPrice is not provided here; keep backwards compatibility
    return created;
  });
}

export async function createIncomeWithItems(
  data: IncomeInsert,
  items: Array<{ productId: number; quantity: number; unitPrice: string }>,
): Promise<Income> {
  return db.transaction(async (tx) => {
    // Decrement stock and verify availability
    for (const item of items) {
      const [row] = await tx.select().from(products).where(eq(products.id, item.productId));
      if (!row) throw new Error("Produto não encontrado");
      const newQty = (row.quantity ?? 0) - item.quantity;
      if (newQty < 0) {
        throw new Error(
          `Estoque insuficiente para o produto "${row.name}". Disponível: ${row.quantity}, solicitado: ${item.quantity}`,
        );
      }
      await tx.update(products).set({ quantity: newQty }).where(eq(products.id, item.productId));
    }

    const [created] = await tx.insert(incomes).values(data).returning();
    if (!created) throw new Error("Falha ao criar a entrada de receita.");

    for (const item of items) {
      await tx.insert(incomeItem).values({
        incomeId: created.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    return created;
  });
}

// List items sold for a specific income (with product name)
export async function listItemsForIncome(incomeId: number) {
  return db
    .select({
      productId: incomeItem.productId,
      quantity: incomeItem.quantity,
      unitPrice: incomeItem.unitPrice,
      name: products.name,
    })
    .from(incomeItem)
    .leftJoin(products, eq(products.id, incomeItem.productId))
    .where(eq(incomeItem.incomeId, incomeId));
}