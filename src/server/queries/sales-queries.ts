"use server";

// Sales are currently backed by the same table and logic as incomes.
// This module provides a sales-named API surface while reusing income queries.

import type { Income as Sale, IncomeInsert as SaleInsert } from "@/server/db/schema/incomes-schema";
import {
  createIncome as createSale,
  getIncomeById as getSaleById,
  updateIncome as updateSale,
  deleteIncome as deleteSale,
  listIncomes as listSales,
  sumIncomesByDateRange as sumSalesByDateRange,
  sumProfitAmountsByDateRange as sumSalesProfitAmountsByDateRange,
  sumTotalProfitByDateRange as sumSalesTotalProfitByDateRange,
  createIncomeWithItems as createSaleWithItems,
  updateIncomeWithItems as updateSaleWithItems,
  listItemsForIncome as listItemsForSale,
  createIncomeAndDecrementStock as createSaleAndDecrementStock,
} from "@/server/queries/income-queries";

export type { Sale, SaleInsert };

export {
  createSale,
  getSaleById,
  updateSale,
  deleteSale,
  listSales,
  sumSalesByDateRange,
  sumSalesProfitAmountsByDateRange,
  sumSalesTotalProfitByDateRange,
  createSaleWithItems,
  updateSaleWithItems,
  listItemsForSale,
  createSaleAndDecrementStock,
};

// Aggregate product-level profit for a date range: SUM((unit_price - products.cost) * quantity)
import { db } from "@/server/db";
import { incomes } from "@/server/db/schema/incomes-schema";
import { incomeItem } from "@/server/db/schema/income-items";
import { products } from "@/server/db/schema/products";
import { and, gte, lte, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function sumSalesProductProfitByDateRange(startDate: string, endDate: string): Promise<number> {
  const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
  const endDateTime = new Date(`${endDate}T23:59:59.999Z`);

  const result = await db
    .select({
      profit: sql<number>`COALESCE(SUM( (CAST(${incomeItem.unitPrice} AS numeric) - CAST(${products.cost} AS numeric)) * ${incomeItem.quantity} ), 0)`,
    })
    .from(incomeItem)
    .leftJoin(incomes, eq(incomes.id, incomeItem.incomeId))
    .leftJoin(products, eq(products.id, incomeItem.productId))
    .where(and(gte(incomes.dateTime, startDateTime), lte(incomes.dateTime, endDateTime)));

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
        .select({ total: sql<number>`COALESCE(SUM(CAST(${incomes.value} AS numeric)), 0)` })
        .from(incomes)
        .where(and(gte(incomes.dateTime, startDateTime), lte(incomes.dateTime, endDateTime)));
      return Number(result[0]?.total ?? 0);
    })(),
  ]);
  return { totalRevenue: revenue, productProfit };
}
