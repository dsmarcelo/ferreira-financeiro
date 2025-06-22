import AddIncome from "@/app/_components/dialogs/add/add-income";
import { Button } from "@/components/ui/button";
import { listIncomes } from "@/server/queries/income-queries";
import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import IncomeList from "@/app/_components/lists/income-list";

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
          <AddIncome>
            <Button className="rounded-full">Adicionar Receita</Button>
          </AddIncome>
        </div>
      </Header>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <Suspense fallback={<Loading />}>
          <IncomeList incomes={incomes} />
        </Suspense>
      </main>
      <div className="fixed bottom-24 block w-full px-5 sm:hidden">
        <AddIncome>
          <Button className="h-12 w-full rounded-full">Adicionar Receita</Button>
        </AddIncome>
      </div>
    </div>
  );
}
