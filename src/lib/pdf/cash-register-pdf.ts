import { formatCurrency } from "@/lib/utils";
import { sharePDF, downloadPDF, type TableData } from "./pdf-tools";
import type { CashRegister } from "@/server/db/schema/cash-register-schema";
import { formatInTimeZone } from "date-fns-tz";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";

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
      date: formatInTimeZone(item.date, "America/Sao_Paulo", "dd/MM/yyyy"),
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
  const doc = new jsPDF();

  // Calculate total value (convert string values to numbers)
  const total = cashRegisters.reduce((sum, item) => sum + Number(item.value), 0);

  // Add title
  doc.setFontSize(20);
  doc.text(title, 14, 20);

  // Generate table
  autoTable(doc, {
    startY: 30,
    head: [tableData.columns.map((col) => col.header)],
    body: tableData.rows.map((row) =>
      tableData.columns.map((col) => {
        // Convert unknown values to string for PDF table cells
        const value = row[col.accessorKey];
        return typeof value === "string" || typeof value === "number"
          ? value
          : "";
      }),
    ),
    foot: [["TOTAL", formatCurrency(total)]],
    theme: "striped",    headStyles: {
      fillColor: [0, 0, 0],
      textColor: 255,
      fontStyle: "bold",
      cellPadding: 2,
      valign: "middle",
    },
    footStyles: {
      fillColor: [0, 0, 0],
      textColor: 255,
      fontStyle: "bold",
      cellPadding: 2,
      valign: "middle",
    },
    styles: {
      fontSize: 10,
      cellPadding: 1,
      valign: "middle",
    },    columnStyles: {
      0: {
        halign: "left",
      },
      1: {
        halign: "right",
      },
    },    didParseCell: function (data) {
      // Ensure header and footer cells follow column alignment
      if (data.section === 'head' || data.section === 'foot') {
        if (data.column.index === 0) {
          data.cell.styles.halign = 'left';
        } else if (data.column.index === 1) {
          data.cell.styles.halign = 'right';
        }
      }
    },
  });

  return doc;
}

/**
 * Downloads the cash register list as a PDF.
 */
export function downloadCashRegisterPDF(
  cashRegisters: CashRegister[],
  title: string,
) {
  const doc = generateCashRegisterPDF(cashRegisters, title);
  return downloadPDF(doc, title);
}

/**
 * Shares the cash register list as a PDF.
 */
export async function shareCashRegisterPDF(
  cashRegisters: CashRegister[],
  title: string,
) {
  const doc = generateCashRegisterPDF(cashRegisters, title);
  await sharePDF(doc, title);
}
