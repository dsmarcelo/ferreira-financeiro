"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateSummaryPDF } from "@/lib/pdf/summary-pdf";
import { downloadPDF } from "@/lib/pdf/pdf-tools";
import { listExpensesAndPurchasesByDateRange } from "@/server/queries/summary-queries";
import { formatMonth } from "@/lib/utils";
import { sumCashRegisterByDateRange } from "@/server/queries/summary-queries";
import { sumPersonalExpenseByDateRange } from "@/server/queries/summary-queries";
import { sumStoreExpenseByDateRange } from "@/server/queries/summary-queries";
import { sumProductPurchaseByDateRange } from "@/server/queries/summary-queries";
import { getProfit } from "@/server/queries/summary-queries";

interface SummaryPDFButtonProps {
  from: string;
  to: string;
}

export function SummaryPDFButton({ from, to }: SummaryPDFButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGeneratePDF() {
    setIsLoading(true);
    try {
      const data = await listExpensesAndPurchasesByDateRange(from, to);
      const totalCashRegister = await sumCashRegisterByDateRange(from, to);
      const totalPersonalExpenses = await sumPersonalExpenseByDateRange(
        from,
        to,
      );
      const totalStoreExpenses = await sumStoreExpenseByDateRange(from, to);
      const totalProductPurchases = await sumProductPurchaseByDateRange(
        from,
        to,
      );
      const totalExpenses = totalPersonalExpenses + totalStoreExpenses;
      const totalProfit = await getProfit(from, to);
      const doc = generateSummaryPDF(
        data,
        `Relatório - ${formatMonth(from)}`,
        totalProfit,
        totalExpenses,
        totalCashRegister,
        totalPersonalExpenses,
        totalStoreExpenses,
        totalProductPurchases,
      );
      downloadPDF(doc, `Relatório - ${formatMonth(from)}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      className="h-14 w-full rounded-xl"
      onClick={handleGeneratePDF}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? "Gerando PDF..." : "Baixar Relatório Mensal"}
    </Button>
  );
}
