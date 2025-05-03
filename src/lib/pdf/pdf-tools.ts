/* eslint-disable */
// @ts-nocheck

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";

export interface TableData {
  rows: Array<Record<string, unknown>>;
  columns: Array<{
    header: string;
    accessorKey: string;
  }>;
}

/**
 * Generates a PDF document with a table
 * @param data - Object containing rows and columns for the table
 * @param title - Title of the PDF document
 * @returns The generated PDF document
 */
export function generatePDF(
  data: TableData,
  title: string,
  highlightLastRow?: boolean,
): jsPDF {
  const doc = new jsPDF();

  // Add title (centered)
  doc.setFontSize(20);
  const pageWidth = doc.internal.pageSize.getWidth();
  const textWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - textWidth) / 2, 20);

  // Generate table
  autoTable(doc, {
    startY: 30,
    head: [data.columns.map((col) => col.header)],
    body: data.rows.map((row) =>
      data.columns.map((col) => {
        // Convert unknown values to string for PDF table cells
        const value = row[col.accessorKey];
        return typeof value === "string" || typeof value === "number"
          ? value
          : "";
      }),
    ),
    theme: "grid",
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: 255,
      fontStyle: "bold",
      cellPadding: 2,
      valign: "middle",
      halign: "center",
    },
    styles: {
      fontSize: 10,
      cellPadding: 1,
      valign: "middle",
    },
    columnStyles: Object.fromEntries(
      data.columns
        .map((col, idx) => {
          if (col.accessorKey === "value") return [idx, { halign: "right" }];
          if (col.accessorKey === "dueDate" || col.accessorKey === "isPaid")
            return [idx, { halign: "center" }];
          return null;
        })
        .filter(Boolean) as [number, { halign: string }][],
    ),
    didParseCell: (dataCell) => {
      if (
        highlightLastRow &&
        dataCell.section === "body" &&
        dataCell.row.index === data.rows.length - 1
      ) {
        dataCell.cell.styles.fillColor = [0, 0, 0];
        dataCell.cell.styles.textColor = 255;
        dataCell.cell.styles.fontStyle = "bold";
      }
    },
  });

  return doc;
}

/**
 * Shares a PDF document using the Web Share API or downloads it
 * @param doc - The PDF document to share
 * @param title - Title of the PDF document
 */
export async function sharePDF(doc: jsPDF, title: string) {
  const blob = doc.output("blob");
  const file = new File([blob], `${title}.pdf`, { type: "application/pdf" });
  // Attempt native share if possible
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title, files: [file] });
      return;
    } catch (error) {
      console.error("Error sharing PDF:", error);
    }
  }
  // Fallback: open PDF blob URL in new window/tab
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  // Revoke URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Formats data into a readable text message for WhatsApp
 * @param data - Object containing rows and columns for the table
 * @param title - Title of the message
 * @returns Formatted text message
 */
function formatCashControlWhatsAppMessage(
  data: TableData,
  title: string,
): string {
  // Create header
  let message = `*${title}*\n\n`;

  // Add column headers
  const headers = data.columns.map((col) => col.header).join(" | ");
  message += `*${headers}*\n`;
  message += "-".repeat(headers.length) + "\n";

  // Add rows
  data.rows.forEach((row) => {
    const rowData = data.columns.map((col) => row[col.accessorKey]).join(" | ");
    message += `${rowData}\n`;
  });

  // Add summary
  if (data.columns.some((col) => col.accessorKey === "amount")) {
    const total = data.rows.reduce((sum, row) => {
      // Type assertion for amount field + safety check
      const amountValue = row.amount as string;
      const amount = parseFloat(amountValue?.replace("R$ ", "") || "0");
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    message += `\n*Total: ${formatCurrency(total)}*`;
  }

  return message;
}

/**
 * Shares data directly to WhatsApp as formatted text
 * @param data - Object containing rows and columns for the table
 * @param title - Title of the message
 */
export async function shareToWhatsApp(data: TableData, title: string) {
  const message = formatCashControlWhatsAppMessage(data, title);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

/**
 * Generates and shares a PDF with a table
 * @param data - Object containing rows and columns for the table
 * @param title - Title of the PDF document
 */
export async function generateAndSharePDF(doc: jsPDF, title: string) {
  await sharePDF(doc, title);
}

export function downloadPDF(doc: jsPDF, title: string) {
  // Create blob URL for PDF and trigger download via anchor
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke URL to release memory
  URL.revokeObjectURL(url);
}
