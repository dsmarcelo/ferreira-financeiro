import { formatCurrency } from "@/lib/utils";
import { getProfit } from "@/server/queries/summary-queries";

export default async function ProfitText({
  from,
  to,
}: {
  from: string;
  to: string;
}) {
  const profit = await getProfit(from, to);

  return (
    <div className="flex flex-col gap-4">
      <h5 className="text-xl font-bold">Lucro</h5>
      {/* Optionally, you can show a placeholder or skeleton here if params are missing */}
      <h1 className="text-4xl font-bold">
        <span className="text-muted-foreground">R$</span>{" "}
        {formatCurrency(profit)}
      </h1>
    </div>
  );
}
