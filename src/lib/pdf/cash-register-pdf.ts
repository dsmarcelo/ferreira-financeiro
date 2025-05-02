import { formatCurrency } from "@/lib/utils";
import {
  generatePDF,
  sharePDF,
  downloadPDF,
  type TableData,
} from "./pdf-tools";
import type { CashRegister } from "@/server/db/schema/cash-register";
import { format } from "date-fns-tz";

/**
 * Converts a list of CashRegister entries to TableData for PDF generation.
 */
export function cashRegistersToTableData(
  cashRegisters: CashRegister[],
): TableData {
  return {
    columns: [
      { header: "Data", accessorKey: "date" },
      { header: "Valor", accessorKey: "value" },
    ],
    rows: cashRegisters.map((item) => ({
      date: format(item.date, "dd/MM/yyyy"),
      value: formatCurrency(item.value),
    })),
  };
}

/**
 * Generates and returns a PDF document for the cash register list.
 */
export function generateCashRegisterPDF(
  cashRegisters: CashRegister[],
  title: string,
) {
  const tableData = cashRegistersToTableData(cashRegisters);
  return generatePDF(tableData, title);
}

/**
 * Downloads the cash register list as a PDF.
 */
export function downloadCashRegisterPDF(
  cashRegisters: CashRegister[],
  title: string,
) {
  const tableData = cashRegistersToTableData(cashRegisters);
  return downloadPDF(tableData, title);
}

/**
 * Shares the cash register list as a PDF.
 */
export async function shareCashRegisterPDF(
  cashRegisters: CashRegister[],
  title: string,
) {
  const tableData = cashRegistersToTableData(cashRegisters);
  const doc = generatePDF(tableData, title);
  await sharePDF(doc, title);
}
