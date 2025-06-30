import Link from "next/link";
import { sumExpensesByDateRangeWithSource } from "@/server/queries/summary-queries";
import { sumIncomesByDateRange, sumProfitAmountsByDateRange } from "@/server/queries/income-queries";
import { formatCurrency } from "@/lib/utils";

// Props for the SummaryCards component
interface SummaryCardsProps {
  from: string;
  to: string;
}

// Server component to fetch and display summary cards for the given date range
export default async function SummaryCards({ from, to }: SummaryCardsProps) {
  // Fetch all summary data in parallel for performance
  const [totalSales, profit, personalExpenses, storeExpenses] =
    await Promise.all([
      sumIncomesByDateRange(from, to),
      sumProfitAmountsByDateRange(from, to),
      sumExpensesByDateRangeWithSource({
        startDate: from,
        endDate: to,
        source: "personal",
      }),
      sumExpensesByDateRangeWithSource({
        startDate: from,
        endDate: to,
        source: "store",
      }),
    ]);

  return (
    <div className="container mx-auto flex max-w-screen-sm flex-col gap-4 leading-none">
      {/* Total Sales Card */}
      <Link
        href="/caixa"
        className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
      >
        <p className="">
          Vendas
        </p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold flex items-center gap-2">
            {formatCurrency(totalSales)}
            <span className="text-muted-foreground text-sm font-medium">
              {"(" + formatCurrency(profit) + ")"}
            </span>
          </p>
        </div>
      </Link>
      <div className="grid grid-cols-2 gap-4">
        {/* Personal Expenses Card */}
        <Link
          href="/despesas-pessoais"
          className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
        >
          <p className="text-sm md:text-base">Despesas pessoais</p>
          <p className="text-lg font-semibold">
            {formatCurrency(personalExpenses)}
          </p>
        </Link>
        {/* Store Expenses Card */}
        <Link
          href="/despesas-loja"
          className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
        >
          <p className="text-sm md:text-base">Despesas da Loja</p>
          <p className="text-lg font-semibold">
            {formatCurrency(storeExpenses)}
          </p>
        </Link>
      </div>
      {/* Product Purchases Card */}
      {/* <Link
        href="/compras-produtos"
        className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
      >
        <p className="text-sm md:text-base">Compras de Produtos</p>
        <p className="text-lg font-semibold">
          {formatCurrency(productPurchases)}
        </p>
      </Link> */}
    </div>
  );
}
