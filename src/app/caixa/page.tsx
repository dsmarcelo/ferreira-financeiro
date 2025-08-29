import AddIncome from "@/app/_components/dialogs/add/add-income";
import { Button } from "@/components/ui/button";
import { listIncomes } from "@/server/queries/income-queries";
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
  const incomes = listIncomes(from, to);

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <Header className="sticky top-0 z-50 flex-none">
        <div className="hidden sm:block">
          <div className="flex gap-2">
            <AddIncome>
              <Button className="rounded-full">Adicionar Entrada</Button>
            </AddIncome>
          </div>
        </div>
      </Header>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4">
        <Suspense fallback={<Loading />}>
          <DailyIncomeList sales={incomes} />
        </Suspense>
      </main>
      <div className="fixed bottom-24 block w-full px-5 sm:hidden">
        <div className="flex gap-2">
          <AddIncome>
            <Button className="h-12 w-full rounded-full">
              Adicionar Entrada
            </Button>
          </AddIncome>
        </div>
      </div>
    </div>
  );
}
