"use server";

import { db } from "@/server/db";
import { sales } from "@/server/db/schema/sales-schema";
import { customers } from "@/server/db/schema/customers";
import type { Sale, SaleInsert } from "@/server/db/schema/sales-schema";
import { products } from "@/server/db/schema/products-schema";
import { incomeItem } from "@/server/db/schema/income-items";
import { and, asc, eq, gte, lte, sum } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Create a new sale
export async function createSale(data: SaleInsert): Promise<Sale> {
  const [created] = await db.insert(sales).values(data).returning();
  if (!created) throw new Error("Falha ao criar a venda.");
  return created as Sale;
}

// Get a sale by ID
export async function getSaleById(id: number): Promise<Sale | undefined> {
  const [row] = await db.select().from(sales).where(eq(sales.id, id));
  return row as Sale | undefined;
}

// Update a sale by ID
export async function updateSale(
  id: number,
  data: Partial<SaleInsert>,
): Promise<Sale | undefined> {
  const [updated] = await db
    .update(sales)
    .set(data)
    .where(eq(sales.id, id))
    .returning();
  return updated as Sale | undefined;
}

// Delete a sale by ID (and its related items)
export async function deleteSale(id: number): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(incomeItem).where(eq(incomeItem.salesId, id));
    await tx.delete(sales).where(eq(sales.id, id));
  });
}

// List sales in a date range
export async function listSales(
  startDate: string,
  endDate: string,
): Promise<Sale[]> {
  if (startDate && endDate) {
    const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
    const endDateTime = new Date(`${endDate}T23:59:59.999Z`);
    // Join customers to include customerName for display
    const rows = await db
      .select({
        id: sales.id,
        description: sales.description,
        value: sales.value,
        dateTime: sales.dateTime,
        discountType: sales.discountType,
        discountValue: sales.discountValue,
        customerId: sales.customerId,
        createdAt: sales.createdAt,
        updatedAt: sales.updatedAt,
        customerName: customers.name,
      })
      .from(sales)
      .leftJoin(customers, eq(customers.id, sales.customerId))
      .where(and(gte(sales.dateTime, startDateTime), lte(sales.dateTime, endDateTime)))
      .orderBy(asc(sales.dateTime));
    return rows as unknown as Sale[];
  }
  return [];
}

// Sum of sale values in a date range
export async function sumSalesByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
  const endDateTime = new Date(`${endDate}T23:59:59.999Z`);
  const result = await db
    .select({ sum: sum(sales.value) })
    .from(sales)
    .where(and(gte(sales.dateTime, startDateTime), lte(sales.dateTime, endDateTime)));
  return Number(result[0]?.sum ?? 0);
}

// Sum of profit amounts computed from value * (profitMargin/100) in a date range
export async function sumSalesProfitAmountsByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  const rows = await listSales(startDate, endDate);
  const total = rows.reduce((acc, s) => {
    const totalValue = Number(s.value) || 0;
    return acc + totalValue;
  }, 0);
  return total;
}

// Breakdown totals for the range: total, profit amount, base value
export async function sumSalesTotalProfitByDateRange(
  startDate: string,
  endDate: string,
): Promise<{ totalIncome: number; totalProfitAmount: number; totalBaseValue: number }> {
  const rows = await listSales(startDate, endDate);
  const totals = rows.reduce(
    (acc, s) => {
      const totalValue = Number(s.value) || 0;
      const profitAmount = totalValue;
      const baseValue = totalValue - profitAmount;
      return {
        totalIncome: acc.totalIncome + totalValue,
        totalProfitAmount: acc.totalProfitAmount + profitAmount,
        totalBaseValue: acc.totalBaseValue + baseValue,
      };
    },
    { totalIncome: 0, totalProfitAmount: 0, totalBaseValue: 0 },
  );
  return totals;
}

// Create sale and decrement stock atomically
export async function createSaleAndDecrementStock(
  data: SaleInsert,
  items: Array<{ productId: number; quantity: number }>,
): Promise<Sale> {
  return db.transaction(async (tx) => {
    for (const item of items) {
      const [row] = await tx.select().from(products).where(eq(products.id, item.productId));
      if (!row) throw new Error("Produto não encontrado");
      const currentQty = Number(row.quantity ?? 0);
      const newQty = currentQty - item.quantity;
      if (newQty < 0) {
        throw new Error(
          `Estoque insuficiente para o produto "${row.name}". Disponível: ${row.quantity}, solicitado: ${item.quantity}`,
        );
      }
      await tx
        .update(products)
        .set({ quantity: String(newQty) as typeof products.$inferInsert["quantity"] })
        .where(eq(products.id, item.productId));
    }

    const [created] = await tx.insert(sales).values(data).returning();
    if (!created) throw new Error("Falha ao criar a venda.");
    return created as Sale;
  });
}

// Create sale with items and decrement stock
export async function createSaleWithItems(
  data: SaleInsert,
  items: Array<{ productId: number; quantity: number; unitPrice: string }>,
): Promise<Sale> {
  return db.transaction(async (tx) => {
    for (const item of items) {
      const [row] = await tx.select().from(products).where(eq(products.id, item.productId));
      if (!row) throw new Error("Produto não encontrado");
      const currentQty = Number(row.quantity ?? 0);
      const newQty = currentQty - item.quantity;
      if (newQty < 0) {
        throw new Error(
          `Estoque insuficiente para o produto "${row.name}". Disponível: ${row.quantity}, solicitado: ${item.quantity}`,
        );
      }
      await tx
        .update(products)
        .set({ quantity: String(newQty) as typeof products.$inferInsert["quantity"] })
        .where(eq(products.id, item.productId));
    }

    const [created] = await tx.insert(sales).values(data).returning();
    if (!created) throw new Error("Falha ao criar a venda.");

    for (const item of items) {
      await tx.insert(incomeItem).values({
        salesId: (created as Sale).id,
        productId: item.productId,
        quantity: String(item.quantity),
        unitPrice: item.unitPrice,
      });
    }

    return created as Sale;
  });
}

// Update sale and fully replace its items, restoring stock
export async function updateSaleWithItems(
  id: number,
  data: Partial<SaleInsert>,
  items: Array<{ productId: number; quantity: number; unitPrice: string }>,
): Promise<Sale | undefined> {
  return db.transaction(async (tx) => {
    // Restore stock from existing items
    const existingItems = await tx.select().from(incomeItem).where(eq(incomeItem.salesId, id));
    for (const ex of existingItems) {
      const [row] = await tx.select().from(products).where(eq(products.id, ex.productId));
      if (!row) continue;
      const restoredQty = Number(row.quantity ?? 0) + Number(ex.quantity ?? 0);
      await tx
        .update(products)
        .set({ quantity: String(restoredQty) as typeof products.$inferInsert["quantity"] })
        .where(eq(products.id, ex.productId));
    }

    // Remove existing item rows
    await tx.delete(incomeItem).where(eq(incomeItem.salesId, id));

    // Decrement stock for new items and insert them
    if (items && items.length > 0) {
      for (const item of items) {
        const [row] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (!row) throw new Error("Produto não encontrado");
        const currentQty = Number(row.quantity ?? 0);
        const newQty = currentQty - item.quantity;
        if (newQty < 0) {
          throw new Error(
            `Estoque insuficiente para o produto "${row.name}". Disponível: ${row.quantity}, solicitado: ${item.quantity}`,
          );
        }
        await tx
          .update(products)
          .set({ quantity: String(newQty) as typeof products.$inferInsert["quantity"] })
          .where(eq(products.id, item.productId));
      }

      for (const item of items) {
        await tx.insert(incomeItem).values({
          salesId: id,
          productId: item.productId,
          quantity: String(item.quantity),
          unitPrice: item.unitPrice,
        });
      }
    }

    // Update sale itself
    const [updated] = await tx.update(sales).set(data).where(eq(sales.id, id)).returning();
    return updated as Sale | undefined;
  });
}

// List items sold for a specific sale (with product info)
export async function listItemsForSale(saleId: number) {
  return db
    .select({
      productId: incomeItem.productId,
      quantity: incomeItem.quantity,
      unitPrice: incomeItem.unitPrice,
      name: products.name,
      cost: products.cost,
      price: products.price,
    })
    .from(incomeItem)
    .leftJoin(products, eq(products.id, incomeItem.productId))
    .where(eq(incomeItem.salesId, saleId));
}

// Aggregate product-level profit for a date range: SUM((unit_price - products.cost) * quantity)
export async function sumSalesProductProfitByDateRange(startDate: string, endDate: string): Promise<number> {
  const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
  const endDateTime = new Date(`${endDate}T23:59:59.999Z`);

  const result = await db
    .select({
      profit: sql<number>`COALESCE(SUM( (CAST(${incomeItem.unitPrice} AS numeric) - CAST(${products.cost} AS numeric)) * ${incomeItem.quantity} ), 0)`,
    })
    .from(incomeItem)
    .leftJoin(sales, eq(incomeItem.salesId, sales.id))
    .leftJoin(products, eq(products.id, incomeItem.productId))
    .where(and(gte(sales.dateTime, startDateTime), lte(sales.dateTime, endDateTime)));

  return Number(result[0]?.profit ?? 0);
}

export async function sumSalesRevenueAndProductProfitByDateRange(
  startDate: string,
  endDate: string,
): Promise<{ totalRevenue: number; productProfit: number }> {
  const [productProfit, revenue] = await Promise.all([
    sumSalesProductProfitByDateRange(startDate, endDate),
    (async () => {
      const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
      const endDateTime = new Date(`${endDate}T23:59:59.999Z`);
      const result = await db
        .select({ total: sql<number>`COALESCE(SUM(CAST(${sales.value} AS numeric)), 0)` })
        .from(sales)
        .where(and(gte(sales.dateTime, startDateTime), lte(sales.dateTime, endDateTime)));
      return Number(result[0]?.total ?? 0);
    })(),
  ]);
  return { totalRevenue: revenue, productProfit };
}
