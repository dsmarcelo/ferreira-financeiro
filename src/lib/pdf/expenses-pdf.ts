/* eslint-disable */
// @ts-nocheck

import { formatCurrency } from "@/lib/utils";
import {
  generatePDF,
  sharePDF,
  downloadPDF,
  type TableData,
} from "./pdf-tools";
import type { Expense, ExpenseSource } from "@/server/db/schema/expense-schema";
import { formatInTimeZone } from "date-fns-tz";
import { getMonthFromDate } from "@/lib/utils";

function generateTitle(source: ExpenseSource, date: string) {
  const month = getMonthFromDate(date);
  switch (source) {
    case "personal":
      return "Despesas Pessoais - " + month;
    case "store":
      return "Despesas da Loja - " + month;
    case "product_purchase":
      return "Compras de Produtos - " + month;
    default:
      return "Despesas - " + month;
  }
}

/**
 * Converts a list of Expense entries to TableData for PDF generation.
 */
export function expensesToTableData(expenses: Expense[], source?: ExpenseSource): TableData {

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (a.date && b.date) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return 0;
  });

  const rows = sortedExpenses.map((item) => ({
    description: item.description,
    dueDate: item.date
      ? formatInTimeZone(item.date, "America/Sao_Paulo", "dd/MM/yyyy")
      : "-",
    isPaid: item.isPaid ? "PAGO" : "",
    value: formatCurrency(item.value),
  }));
  const total = expenses.reduce((acc, item) => acc + Number(item.value), 0);
  rows.push({
    description: "Total",
    dueDate: "",
    isPaid: "",
    value: formatCurrency(total),
    _isTotal: true,
  });
  return {
    columns: [
      { header: "DESCRIÇÃO", accessorKey: "description" },
      { header: "VENCIMENTO", accessorKey: "dueDate" },
      { header: "SITUAÇÃO", accessorKey: "isPaid" },
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
 * Generates and returns a PDF document for the expenses list.
 */
export function generateExpensesPDF(
  expenses: Expense[],
) {
  const title = generateTitle(expenses[0].source, expenses[0].date);

  const tableData = expensesToTableData(expenses);
  return generatePDF(tableData, title, true);
}
/**
 * Downloads the expenses list as a PDF.
 */
export function downloadExpensesPDF(expenses: Expense[]) {
  const title = generateTitle(expenses[0].source, expenses[0].date);
  const doc = generateExpensesPDF(expenses);
  downloadPDF(doc, title);
}

/**
 * Shares the expenses list as a PDF.
 */
export function shareExpensesPDF(expenses: Expense[]) {
  const title = generateTitle(expenses[0].source, expenses[0].date);
  const doc = generateExpensesPDF(expenses);
  sharePDF(doc, title);
}

