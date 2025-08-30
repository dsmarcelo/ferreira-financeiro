import { listSales } from "@/server/queries/sales-queries";
import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import DailyIncomeList from "@/app/_components/lists/daily-income-list";

export default async function CaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ from: string; to: string }>;
}) {
  const { from, to } = await searchParams;
  const sales = listSales(from, to);

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <Header className="sticky top-0 z-50 flex-none" />
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4">
        <Suspense fallback={<Loading />}>
          <DailyIncomeList sales={sales} />
        </Suspense>
      </main>
    </div>
  );
}
