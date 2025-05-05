"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateSummaryPDF } from "@/lib/pdf/summary-pdf";
import { downloadPDF } from "@/lib/pdf/pdf-tools";
import { listExpensesAndPurchasesByDateRange } from "@/server/queries/summary-queries";
import { formatMonth } from "@/lib/utils";

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
      const doc = generateSummaryPDF(data, `Despesas - ${formatMonth(from)}`);
      downloadPDF(doc, `Despesas - ${formatMonth(from)}`);
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
