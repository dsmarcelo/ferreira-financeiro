import { db } from "../db";
import { cashRegister } from "../db/schema/cash-register";
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

// Get a cash register entry by ID
export async function getCashRegisterById(
  id: string,
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
  id: string,
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
export async function deleteCashRegister(id: string): Promise<void> {
  // Delete the record by its primary key
  await db.delete(cashRegister).where(eq(cashRegister.id, id));
}

// List all cash register entries (by date range)
export async function listCashRegisters(
  startDate: string,
  endDate: string,
): Promise<CashRegister[] | []> {
  console.log("fetching cash registers", startDate, endDate);
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
