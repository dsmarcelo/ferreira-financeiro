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

/**
 * Converts a list of ProductPurchase entries to TableData for PDF generation.
 */
export function productPurchasesToTableData(
  productPurchases: Expense[],
): TableData {
  const rows = productPurchases.map((item) => ({
    description: item.description,
    dueDate: item.date
      ? formatInTimeZone(item.date, "America/Sao_Paulo", "dd/MM/yyyy")
      : "-",
    isPaid: item.isPaid ? "Sim" : "Não",
    value: formatCurrency(item.value),
  }));
  const total = productPurchases.reduce((acc, item) => acc + Number(item.value), 0);
  rows.push({
    description: "TOTAL DE COMPRAS DE PRODUTOS",
    dueDate: "",
    isPaid: "",
    value: formatCurrency(total),
    _isTotal: true,
  });
  return {
    columns: [
      { header: "DESCRIÇÃO", accessorKey: "description" },
      { header: "VENCIMENTO", accessorKey: "dueDate" },
      { header: "PAGO", accessorKey: "isPaid" },
      { header: "VALOR", accessorKey: "value" },
    ],
    rows: rows.map(row => ({
      description: row.description,
      dueDate: row.dueDate,
      isPaid: row.isPaid,
      value: row.value,
      _isTotal: row._isTotal,
    })),
  };
}

/**
 * Generates and returns a PDF document for the product purchases list.
 */
export function generateProductPurchasesPDF(
  productPurchases: Expense[],
  title: string,
) {
  const tableData = productPurchasesToTableData(productPurchases);
  return generatePDF(tableData, title, true);
}

/**
 * Downloads the product purchases list as a PDF.
 */
export function downloadProductPurchasesPDF(
  productPurchases: Expense[],
  title: string,
) {
  const doc = generateProductPurchasesPDF(productPurchases, title);
  return downloadPDF(doc, title);
}

/**
 * Shares the product purchases list as a PDF.
 */
export function shareProductPurchasesPDF(
  productPurchases: Expense[],
  title: string,
) {
  const doc = generateProductPurchasesPDF(productPurchases, title);
  sharePDF(doc, title);
}
