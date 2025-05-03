import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatShortDate, stringToDate } from "@/lib/utils";
import type { ExpenseSummary } from "@/server/queries/summary-queries";

// Helper type for grouping entries by due date
type GroupedExpenses = {
  dueDate: string;
  entries: ExpenseSummary[];
};

// Groups all expenses by their due date, sorted ascending
function groupExpensesByDueDate(expenses: ExpenseSummary[]): GroupedExpenses[] {
  const groups: Record<string, ExpenseSummary[]> = {};
  for (const exp of expenses) {
    if (!groups[exp.dueDate]) {
      groups[exp.dueDate] = [];
    }
    groups[exp.dueDate].push(exp);
  }
  // Sort by date ascending
  return Object.entries(groups)
    .sort(([a], [b]) => stringToDate(a).getTime() - stringToDate(b).getTime())
    .map(([dueDate, entries]) => ({ dueDate, entries }));
}

// Sums the total value for a group of entries
function getTotal(entries: ExpenseSummary[]) {
  return entries.reduce((acc, e) => acc + e.value, 0);
}

/**
 * Generates a summary PDF with grouped expense tables.
 * The table header is rendered only once at the top.
 * Each group shows a section with due date, entries, and a subtotal.
 */
// Generates a summary PDF with grouped expense tables
export function generateSummaryPDF(
  expenses: ExpenseSummary[], // Array of grouped expense data
  title = "Despesas", // Title for the PDF document
): jsPDF {
  const doc = new jsPDF(); // Create a new jsPDF instance
  const grouped = groupExpensesByDueDate(expenses); // Group expenses by due date

  // Add main title at the top, centered
  doc.setFontSize(18); // Set font size for the title
  const pageWidth = doc.internal.pageSize.getWidth(); // Get the width of the page
  const textWidth = doc.getTextWidth(title); // Calculate width of the title text
  doc.text(title, (pageWidth - textWidth) / 2, 15); // Draw the title centered at y=15

  let y = 25; // Initial y position for content below the title
  // Render the global header row once for all tables
  autoTable(doc, {
    startY: y, // Start table at current y
    head: [["DESCRIÇÃO", "STATUS", "VALOR"]], // Table header columns
    body: [], // No body rows for the header-only table
    theme: "plain", // Use grid theme for table borders
    headStyles: {
      fillColor: [0, 0, 0], // Black background for header
      textColor: 255, // White text
      fontStyle: "bold", // Bold font
      fontSize: 12, // Header font size
      valign: "middle", // Vertically center text
      halign: "center", // Horizontally center text
    },
    styles: {
      fontSize: 10, // Default font size for cells
      cellPadding: 1, // Padding inside cells
      valign: "middle", // Vertically center text
    },
    columnStyles: {
      0: { halign: "left" }, // Left-align first column
      1: { halign: "center", cellWidth: 20 }, // Center-align second column, fixed width
      2: { halign: "right", cellWidth: 30 }, // Right-align third column, fixed width
    },
    didDrawPage: (data) => {
      y = data.cursor.y + 2; // Update y position after header table
    },
  });

  // For each due date group, render a section header and its table rows
  grouped.forEach((group, idx) => {
    const dueDateStr = formatShortDate(group.dueDate); // Format due date as string
    // Section header text with pending or paid status
    const headerText = `${dueDateStr}`; // Compose section header

    // Draw light gray section header bar exactly aligned with the table
    doc.setFillColor(255, 255, 255); // Set fill color for section header
    doc.rect(10, y, pageWidth - 20, 6, "F"); // Draw filled rectangle for header bar (6px high)
    // Draw black border at the bottom of the section header bar
    doc.setDrawColor(0, 0, 0); // Set draw color to black
    doc.setLineWidth(0.5); // 0.5pt line (1px)
    doc.line(10, y + 6, pageWidth - 10, y + 6); // Draw line from left to right under the bar
    doc.setFontSize(10); // Set font size for section header
    doc.setFont(undefined, "normal"); // Set font to bold
    doc.text(headerText, 12, y + 4.5); // Draw section header text, vertically centered in 6px bar
    // Table should start immediately after the bar, with minimal gap

    // Prepare all entry rows for this group
    const rows = group.entries.map((e) => [
      e.description, // Expense description
      e.isPaid ? "Pago" : "", // Checkbox for paid status
      formatCurrency(e.value), // Format value as currency
    ]);

    // Add subtotal row for the group
    rows.push([
      { content: "TOTAL", styles: { fontStyle: "bold", fontSize: 12 } }, // Label for total row
      "", // Empty cell
      {
        content: formatCurrency(getTotal(group.entries)), // Total value for group
        styles: {
          fontStyle: "bold",
          fontSize: 12,
        },
      },
    ]);

    autoTable(doc, {
      startY: y + 6, // Table starts immediately after the 6px-high header bar (minimized gap)
      margin: { left: 10, right: 10 }, // Match the header bar's x and width
      tableWidth: pageWidth - 20, // Ensure exact width match
      head: [], // No header row (already rendered globally)
      body: rows, // All entry rows plus subtotal
      theme: "striped", // Use grid theme
      didParseCell: (data: any) => {
        const isTotalRow = data.row.index === data.table.body.length - 1;
        const isLeftCell = data.column.index === 0;
        if (isTotalRow && isLeftCell) {
          let lw = data.cell.styles.lineWidth;
          if (typeof lw !== "object") {
            lw = { top: lw, right: lw, bottom: lw, left: lw };
          }
          lw.bottom = 0;
          data.cell.styles.lineWidth = lw;
        }
      },
      didDrawCell: (data: any) => {
        // Draw a line above the TOTAL row (subtotal)
        const isTotalRow = data.row.index === data.table.body.length - 1;
        if (isTotalRow) {
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.2);
          doc.line(
            data.table.settings.margin.left,
            data.cell.y,
            pageWidth - data.table.settings.margin.right,
            data.cell.y,
          );
        }
      },
      headStyles: {
        fillColor: [0, 0, 0], // Black header (unused here)
        textColor: 255, // White text
        fontStyle: "bold",
        fontSize: 12,
        valign: "middle",
        halign: "center",
      },
      styles: {
        fontSize: 10, // Default font size
        cellPadding: 1, // Cell padding
        valign: "middle", // Vertically center text
      },
      columnStyles: {
        0: { halign: "left" }, // Left-align description
        1: { halign: "center", cellWidth: 20 }, // Center-align paid, fixed width
        2: { halign: "right", cellWidth: 30 }, // Right-align value, fixed width
      },
      didDrawPage: (data) => {
        y = data.cursor.y + 10; // Update y position after table
      },
      didParseCell: (dataCell) => {
        // Highlight the TOTAL row for each group
        if (
          dataCell.section === "body" &&
          dataCell.row.index === rows.length - 1
        ) {
          dataCell.cell.styles.textColor = 0; // Black text for total
          dataCell.cell.styles.fontStyle = "bold"; // Bold font for total
          dataCell.cell.styles.fontSize = 10; // Larger font for total
        }
      },
    });
    y -= 5; // Add spacing after each table (2 row heights, since each row is 6px)
    // Add a new page if running out of space and there are more groups
    if (
      y > doc.internal.pageSize.getHeight() - 40 &&
      idx < grouped.length - 1
    ) {
      doc.addPage(); // Add new page
      y = 15; // Reset y for new page
    }
  });

  return doc; // Return the generated jsPDF document
}
