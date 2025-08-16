"use server";

import { db } from "../db";
import { cashRegister } from "../db/schema/cash-register";
import { cashRegisterItem } from "../db/schema/cash-register-items";
import { products } from "../db/schema/products";
import type {
  CashRegister,
  CashRegisterInsert,
} from "../db/schema/cash-register";
import { eq, and, gte, lte, sum, asc } from "drizzle-orm";

// Create a new cash register entry
export async function createCashRegister(
  data: CashRegisterInsert,
): Promise<CashRegister> {
  // Insert a new record and return the inserted row
  const [created] = await db.insert(cashRegister).values(data).returning();
  if (!created) throw new Error("Falha ao criar o registro de caixa.");
  return created;
}

export async function createCashRegisterWithItems(
  data: CashRegisterInsert,
  items: Array<{ productId: number; quantity: number; unitPrice: string }>,
): Promise<CashRegister> {
  return db.transaction(async (tx) => {
    // Insert cash register entry first
    const [created] = await tx.insert(cashRegister).values(data).returning();
    if (!created) throw new Error("Falha ao criar o registro de caixa.");

    // Insert items and decrement stock
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
      await tx.insert(cashRegisterItem).values({
        cashRegisterId: created.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    return created;
  });
}

export async function listItemsForCashRegister(cashRegisterId: number) {
  return db
    .select()
    .from(cashRegisterItem)
    .where(eq(cashRegisterItem.cashRegisterId, cashRegisterId));
}

// Get a cash register entry by ID
export async function getCashRegisterById(
  id: number,
): Promise<CashRegister | undefined> {
  // Find a record by its primary key
  const [entry] = await db
    .select()
    .from(cashRegister)
    .where(eq(cashRegister.id, id));
  return entry;
}

// Update a cash register entry by ID
export async function updateCashRegister(
  id: number,
  data: Partial<CashRegisterInsert>,
): Promise<CashRegister | undefined> {
  // Update the record and return the updated row
  const [updated] = await db
    .update(cashRegister)
    .set(data)
    .where(eq(cashRegister.id, id))
    .returning();
  return updated;
}

// Delete a cash register entry by ID
export async function deleteCashRegister(id: number): Promise<void> {
  // Delete the record by its primary key
  await db.delete(cashRegister).where(eq(cashRegister.id, id));
}

// List all cash register entries (by date range)
export async function listCashRegisters(
  startDate: string,
  endDate: string,
): Promise<CashRegister[] | []> {
  if (startDate && endDate) {
    return db
      .select()
      .from(cashRegister)
      .where(
        and(gte(cashRegister.date, startDate), lte(cashRegister.date, endDate)),
      )
      .orderBy(asc(cashRegister.date));
  }
  return [];
}

// Get the sum of values in a date range
export async function sumCashRegisterByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  // Aggregate the sum of the value column for the given date range
  const result = await db
    .select({ sum: sum(cashRegister.value) })
    .from(cashRegister)
    .where(
      and(gte(cashRegister.date, startDate), lte(cashRegister.date, endDate)),
    );
  // Return the sum or 0 if no records
  return Number(result[0]?.sum ?? 0);
}
