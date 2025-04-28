import Link from "next/link";
import { sumCashRegisterByDateRange } from "@/server/queries/cash-register-queries";
import { sumPersonalExpenseByDateRange } from "@/server/queries/personal-expense-queries";
import { sumStoreExpenseByDateRange } from "@/server/queries/store-expense-queries";
import { sumProductPurchaseByDateRange } from "@/server/queries/product-purchase-queries";
import { formatCurrency } from "@/lib/utils";

// Props for the SummaryCards component
interface SummaryCardsProps {
  from: string;
  to: string;
}

// Server component to fetch and display summary cards for the given date range
export default async function SummaryCards({ from, to }: SummaryCardsProps) {
  // Fetch all summary data in parallel for performance
  const [cashRegister, personalExpenses, storeExpenses, productPurchases] =
    await Promise.all([
      sumCashRegisterByDateRange(from, to),
      sumPersonalExpenseByDateRange(from, to),
      sumStoreExpenseByDateRange(from, to),
      sumProductPurchaseByDateRange(from, to),
    ]);

  return (
    <div className="container mx-auto flex max-w-screen-sm flex-col gap-4 leading-none">
      {/* Cash Register Card */}
      <Link
        href="/caixa"
        className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
      >
        <p className="">Caixa</p>
        <p className="text-lg font-semibold">{formatCurrency(cashRegister)}</p>
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
      <Link
        href="/compras-produtos"
        className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
      >
        <p className="text-sm md:text-base">Despesas de Produtos</p>
        <p className="text-lg font-semibold">
          {formatCurrency(productPurchases)}
        </p>
      </Link>
    </div>
  );
}
