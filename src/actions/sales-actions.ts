"use server";

// Sales actions proxy to income actions to preserve behavior while
// introducing a sales-named API surface.

import type { ActionResponse } from "@/actions/income-actions";
import {
  actionCreateIncome as actionCreateSale,
  actionUpdateIncome as actionUpdateSale,
  actionDeleteIncome as actionDeleteSale,
  actionGetIncomeById as actionGetSaleById,
  actionListIncomes as actionListSales,
  actionSumIncomesByDateRange as actionSumSalesByDateRange,
  actionSumProfitAmountsByDateRange as actionSumSalesProfitAmountsByDateRange,
  actionSumTotalProfitByDateRange as actionSumSalesTotalProfitByDateRange,
} from "@/actions/income-actions";

export type { ActionResponse };

export {
  actionCreateSale,
  actionUpdateSale,
  actionDeleteSale,
  actionGetSaleById,
  actionListSales,
  actionSumSalesByDateRange,
  actionSumSalesProfitAmountsByDateRange,
  actionSumSalesTotalProfitByDateRange,
};

