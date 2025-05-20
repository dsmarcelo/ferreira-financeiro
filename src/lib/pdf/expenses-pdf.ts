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
 * Converts a list of Expense entries to TableData for PDF generation.
 */
export function personalExpensesToTableData(
  personalExpenses: Expense[],
): TableData {
  const rows = personalExpenses.map((item) => ({
    description: item.description,
    dueDate: item.date
      ? formatInTimeZone(item.date, "America/Sao_Paulo", "dd/MM/yyyy")
      : "-",
    isPaid: item.isPaid ? "Sim" : "Não",
    value: formatCurrency(item.value),
  }));
  const total = personalExpenses.reduce(
    (acc, item) => acc + Number(item.value),
    0,
  );
  rows.push({
    description: "TOTAL DE DESPESAS PESSOAIS",
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
    rows: rows.map((row) => ({
      description: row.description,
      dueDate: row.dueDate,
      isPaid: row.isPaid,
      value: row.value,
      _isTotal: row._isTotal,
    })),
  };
}

/**
 * Converts a list of Expense entries to TableData for PDF generation.
 */
export function storeExpensesToTableData(
  storeExpenses: Expense[],
): TableData {
  const rows = storeExpenses.map((item) => ({
    description: item.description,
    dueDate: item.date
      ? formatInTimeZone(item.date, "America/Sao_Paulo", "dd/MM/yyyy")
      : "-",
    isPaid: item.isPaid ? "Sim" : "Não",
    value: formatCurrency(item.value),
  }));
  const total = storeExpenses.reduce(
    (acc, item) => acc + Number(item.value),
    0,
  );
  rows.push({
    description: "TOTAL DE DESPESAS PESSOAIS",
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
    rows: rows.map((row) => ({
      description: row.description,
      dueDate: row.dueDate,
      isPaid: row.isPaid,
      value: row.value,
      _isTotal: row._isTotal,
    })),
  };
}

/**
 * Generates and returns a PDF document for the personal expenses list.
 */
export function generatePersonalExpensesPDF(
  personalExpenses: Expense[],
  title: string,
) {
  const tableData = personalExpensesToTableData(personalExpenses);
  return generatePDF(tableData, title, true);
}

/**
 * Generates and returns a PDF document for the store expenses list.
 */
export function generateStoreExpensesPDF(
  storeExpenses: Expense[],
  title: string,
) {
  const tableData = storeExpensesToTableData(storeExpenses);
  return generatePDF(tableData, title, true);
}

/**
 * Downloads the personal expenses list as a PDF.
 */
export function downloadPersonalExpensesPDF(
  personalExpenses: Expense[],
  title: string,
) {
  const doc = generatePersonalExpensesPDF(personalExpenses, title);
  downloadPDF(doc, title);
}

/**
 * Downloads the store expenses list as a PDF.
 */
export function downloadStoreExpensesPDF(
  storeExpenses: Expense[],
  title: string,
) {
  const doc = generateStoreExpensesPDF(storeExpenses, title);
  downloadPDF(doc, title);
}

/**
 * Shares the personal expenses list as a PDF.
 */
export function sharePersonalExpensesPDF(
  personalExpenses: Expense[],
  title: string,
) {
  const doc = generatePersonalExpensesPDF(personalExpenses, title);
  sharePDF(doc, title);
}

/**
 * Shares the store expenses list as a PDF.
 */
export function shareStoreExpensesPDF(
  storeExpenses: Expense[],
  title: string,
) {
  const doc = generateStoreExpensesPDF(storeExpenses, title);
  sharePDF(doc, title);
}
