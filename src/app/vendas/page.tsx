import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import SalesList from "@/app/_components/lists/sales-list";
import {
  listSales,
  sumSalesRevenueAndProductProfitByDateRange,
} from "@/server/queries/sales-queries";

export default async function VendasPage({
  searchParams,
}: {
  searchParams: Promise<{ from: string; to: string }>;
}) {
  const { from, to } = await searchParams;
  const sales = listSales(from, to);
  const aggregates = sumSalesRevenueAndProductProfitByDateRange(from, to);

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <Header className="sticky top-0 z-50 flex-none" />
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-3">
        <Suspense fallback={<Loading />}>
          <SalesList
            sales={sales}
            aggregates={aggregates}
            labels={{ plural: "vendas" }}
          />
        </Suspense>
      </main>
    </div>
  );
}
