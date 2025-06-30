/* eslint-disable */
// @ts-nocheck
import { formatCurrency } from "@/lib/utils";
import {
  generatePDF,
  sharePDF,
  downloadPDF,
  type TableData,
} from "./pdf-tools";
import type { Expense } from "@/server/db/schema/expense-schema";
import { formatInTimeZone } from "date-fns-tz";

// * Converts a list of ProductPurchase entries to TableData for PDF generation.
// export function productPurchasesToTableData(
// productPurchases: Expense[],
// const rows = productPurchases.map((item) => ({
// const total = productPurchases.reduce((acc, item) => acc + Number(item.value), 0);
// * Generates and returns a PDF document for the product purchases list.
// export function generateProductPurchasesPDF(
// productPurchases: Expense[],
// const tableData = productPurchasesToTableData(productPurchases);
// * Downloads the product purchases list as a PDF.
// export function downloadProductPurchasesPDF(
// productPurchases: Expense[],
// const doc = generateProductPurchasesPDF(productPurchases, title);
// * Shares the product purchases list as a PDF.
// export function shareProductPurchasesPDF(
// productPurchases: Expense[],
// const doc = generateProductPurchasesPDF(productPurchases, title);
