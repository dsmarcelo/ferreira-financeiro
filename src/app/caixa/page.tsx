import { listSales, sumSalesByDateRange } from "@/server/queries/sales-queries";
import { sumIncomesByDateRange } from "@/server/queries/income-queries";
import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import DailyIncomeList from "@/app/_components/lists/daily-income-list";
import { formatCurrency } from "@/lib/utils";

export default async function CaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;

  // Wait for valid params before querying
  if (!from || !to) {
    return (
      <div className="flex min-h-screen flex-col pb-24">
        <Header className="sticky top-0 z-50 flex-none" />
        <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4">
          <div className="text-muted-foreground py-8 text-center">
            Selecione um período para visualizar o caixa
          </div>
        </main>
      </div>
    );
  }

  const [salesTotal, incomesTotal] = await Promise.all([
    sumSalesByDateRange(from, to),
    sumIncomesByDateRange(from, to),
  ]);
  const total = (salesTotal ?? 0) + (incomesTotal ?? 0);
  const sales = listSales(from, to);
  const incomes = (await import("@/server/queries/income-queries")).listIncomes(
    from,
    to,
  );

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <Header className="sticky top-0 z-50 flex-none" />
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4">
        <div className="flex items-center justify-between rounded-md border p-5">
          <div>
            <p className="text-muted-foreground text-sm">
              Receita total do período
            </p>
            <p className="text-2xl font-semibold">
              {formatCurrency(total ?? 0)}
            </p>
          </div>
        </div>
        <Suspense fallback={<Loading />}>
          <DailyIncomeList sales={sales} incomes={incomes} />
        </Suspense>
      </main>
    </div>
  );
}
