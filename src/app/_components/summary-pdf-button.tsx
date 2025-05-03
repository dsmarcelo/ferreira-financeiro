"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateSummaryPDF } from "@/lib/pdf/summary-pdf";
import { downloadPDF } from "@/lib/pdf/pdf-tools";
import { listExpensesAndPurchasesByDateRange } from "@/server/queries/summary-queries";

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
      const doc = generateSummaryPDF(data, "Resumo de Despesas");
      downloadPDF(doc, `Resumo-${from}-a-${to}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button className="h-14 rounded-xl w-full" onClick={handleGeneratePDF} disabled={isLoading} aria-busy={isLoading}>
      {isLoading ? "Gerando PDF..." : "Baixar PDF do Resumo"}
    </Button>
  );
}
