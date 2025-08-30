"use server";

// Sales actions proxy to income actions to preserve behavior while
// introducing a sales-named API surface.

import type { ActionResponse } from "@/actions/income-actions";
import {
  actionCreateIncome as actionCreateSale,
  actionUpdateIncome as actionUpdateSale,
  actionDeleteIncome as actionDeleteSale,
  actionGetIncomeById as actionGetSaleById,
  actionListIncomes,
  actionSumIncomesByDateRange as actionSumSalesByDateRange,
  actionSumProfitAmountsByDateRange as actionSumSalesProfitAmountsByDateRange,
  actionSumTotalProfitByDateRange as actionSumSalesTotalProfitByDateRange,
} from "@/actions/income-actions";
import type { Sale } from "@/server/db/schema/sales-schema";
import {
  listItemsForSale,
  sumSalesProductProfitByDateRange,
  sumSalesRevenueAndProductProfitByDateRange,
} from "@/server/queries/sales-queries";

export type { ActionResponse };

export {
  actionCreateSale,
  actionUpdateSale,
  actionDeleteSale,
  actionGetSaleById,
  actionSumSalesByDateRange,
  actionSumSalesProfitAmountsByDateRange,
  actionSumSalesTotalProfitByDateRange,
};

export async function actionListSales(
  from: string,
  to: string,
): Promise<Sale[]> {
  return (await actionListIncomes(from, to)) as Sale[];
}

// Additional sales-specific actions that don't exist on income-actions
export async function actionListItemsForSale(incomeId: number) {
  return listItemsForSale(incomeId);
}

export async function actionSumSalesProductProfitByDateRange(
  startDate: string,
  endDate: string,
) {
  return sumSalesProductProfitByDateRange(startDate, endDate);
}

export async function actionSumSalesRevenueAndProductProfitByDateRange(
  startDate: string,
  endDate: string,
) {
  return sumSalesRevenueAndProductProfitByDateRange(startDate, endDate);
}
