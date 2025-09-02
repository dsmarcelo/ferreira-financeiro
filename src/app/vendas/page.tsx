import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import SalesList from "@/app/_components/lists/sales-list";
import {
  actionListSales as listSales,
  sumSalesRevenueAndProductProfitByDateRange,
  sumSalesProductProfitByDateRange,
} from "@/actions/sales-actions";
import AddSale from "../_components/dialogs/add/add-sale";
import { Button } from "@/components/ui/button";

export default async function VendasPage({
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
        <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-3">
          <div className="text-muted-foreground py-8 text-center">
            Selecione um período para visualizar as vendas
          </div>
        </main>
      </div>
    );
  }

  const sales = listSales(from, to);
  const aggregates = sumSalesRevenueAndProductProfitByDateRange(from, to);
  const totalProfit = sumSalesProductProfitByDateRange(from, to);

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <Header className="sticky top-0 z-50 flex-none">
        <div className="hidden sm:block">
          <AddSale>
            <Button className="rounded-full">Adicionar Venda</Button>
          </AddSale>
        </div>
      </Header>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4">
        <Suspense fallback={<Loading />}>
          <SalesList
            sales={sales}
            aggregates={aggregates}
            totalProfit={totalProfit}
            labels={{ plural: "vendas" }}
          />
        </Suspense>
      </main>
      <div className="fixed bottom-24 block w-full px-5 sm:hidden">
        <AddSale>
          <Button className="h-12 w-full rounded-full">Adicionar Venda</Button>
        </AddSale>
      </div>
    </div>
  );
}
