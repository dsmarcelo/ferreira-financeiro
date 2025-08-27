import { formatCurrency } from "@/lib/utils";

interface IncomeSummaryProps {
  totalSelectedValue: number;
  extraValue: number;
  profitAmount: number;
  finalTotal: number;
  profitMargin: number;
  discountAmount: number;
}

export function IncomeSummary({
  totalSelectedValue,
  extraValue,
  profitAmount,
  finalTotal,
  profitMargin,
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
      <div className="text-sm text-slate-600">
        Valor extra:{" "}
        <span className="font-medium">{formatCurrency(extraValue)}</span>
      </div>
      <div className="text-sm text-slate-600">
        Lucro sobre extra ({profitMargin}%):{" "}
        <span className="font-medium">{formatCurrency(profitAmount)}</span>
      </div>
      <div className="text-base font-medium text-slate-800">
        Total da Venda:{" "}
        <span className="font-bold">{formatCurrency(finalTotal)}</span>
      </div>
    </div>
  );
}
