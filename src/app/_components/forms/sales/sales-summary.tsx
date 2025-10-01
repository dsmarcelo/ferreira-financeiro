import { formatCurrency } from "@/lib/utils";

interface IncomeSummaryProps {
  totalSelectedValue: number;
  finalTotal: number;
  discountAmount: number;
}

export function SalesSummary({
  totalSelectedValue,
  finalTotal,
  discountAmount,
}: IncomeSummaryProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-slate-600">
        Produtos selecionados:{" "}
        <span className="font-medium">
          {formatCurrency(totalSelectedValue)}
        </span>
      </div>
      <div className="text-sm text-slate-600">
        Desconto:{" "}
        <span className="font-bold">{formatCurrency(discountAmount)}</span>
      </div>
      <div className="text-base font-medium text-slate-800">
        Total da Venda:{" "}
        <span className="font-bold">{formatCurrency(finalTotal)}</span>
      </div>
    </div>
  );
}
