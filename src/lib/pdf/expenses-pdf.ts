/* eslint-disable */
// @ts-nocheck

import { formatCurrency } from "@/lib/utils";
import {
  generatePDF,
  sharePDF,
  downloadPDF,
  type TableData,
} from "./pdf-tools";
import type { PersonalExpense } from "@/server/db/schema/personal-expense";
import type { StoreExpense } from "@/server/db/schema/store-expense";
import { formatInTimeZone } from "date-fns-tz";

/**
 * Converts a list of PersonalExpense entries to TableData for PDF generation.
 */
export function personalExpensesToTableData(
  personalExpenses: PersonalExpense[],
): TableData {
  const rows = personalExpenses.map((item) => ({
    description: item.description,
    dueDate: item.dueDate
      ? formatInTimeZone(item.dueDate, "America/Sao_Paulo", "dd/MM/yyyy")
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
 * Converts a list of StoreExpense entries to TableData for PDF generation.
 */
export function storeExpensesToTableData(
  storeExpenses: StoreExpense[],
): TableData {
  const rows = storeExpenses.map((item) => ({
    description: item.description,
    dueDate: item.dueDate
      ? formatInTimeZone(item.dueDate, "America/Sao_Paulo", "dd/MM/yyyy")
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
  personalExpenses: PersonalExpense[],
  title: string,
) {
  const tableData = personalExpensesToTableData(personalExpenses);
  return generatePDF(tableData, title, true);
}

/**
 * Generates and returns a PDF document for the store expenses list.
 */
export function generateStoreExpensesPDF(
  storeExpenses: StoreExpense[],
  title: string,
) {
  const tableData = storeExpensesToTableData(storeExpenses);
  return generatePDF(tableData, title, true);
}

/**
 * Downloads the personal expenses list as a PDF.
 */
export function downloadPersonalExpensesPDF(
  personalExpenses: PersonalExpense[],
  title: string,
) {
  const doc = generatePersonalExpensesPDF(personalExpenses, title);
  downloadPDF(doc, title);
}

/**
 * Downloads the store expenses list as a PDF.
 */
export function downloadStoreExpensesPDF(
  storeExpenses: StoreExpense[],
  title: string,
) {
  const doc = generateStoreExpensesPDF(storeExpenses, title);
  downloadPDF(doc, title);
}

/**
 * Shares the personal expenses list as a PDF.
 */
export function sharePersonalExpensesPDF(
  personalExpenses: PersonalExpense[],
  title: string,
) {
  const doc = generatePersonalExpensesPDF(personalExpenses, title);
  sharePDF(doc, title);
}

/**
 * Shares the store expenses list as a PDF.
 */
export function shareStoreExpensesPDF(
  storeExpenses: StoreExpense[],
  title: string,
) {
  const doc = generateStoreExpensesPDF(storeExpenses, title);
  sharePDF(doc, title);
}
