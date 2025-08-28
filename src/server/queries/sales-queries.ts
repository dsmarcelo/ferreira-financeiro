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
};

