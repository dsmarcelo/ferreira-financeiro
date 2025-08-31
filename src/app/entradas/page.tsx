import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import IncomesList from "@/app/_components/lists/incomes-list";
import { actionListIncomes as listIncomes } from "@/actions/income-actions";
import AddIncome from "../_components/dialogs/add/add-income";
import { Button } from "@/components/ui/button";

export default async function EntradasPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;

  if (!from || !to) {
    return (
      <div className="flex min-h-screen flex-col pb-24">
        <Header className="sticky top-0 z-50 flex-none" />
        <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-3">
          <div className="text-muted-foreground py-8 text-center">
            Selecione um período para visualizar as receitas
          </div>
        </main>
      </div>
    );
  }

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
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-3">
        <Suspense fallback={<Loading />}>
          <IncomesList incomes={incomes} labels={{ plural: "receitas" }} />
        </Suspense>
      </main>
      <div className="fixed bottom-24 block w-full px-5 sm:hidden">
        <div className="flex gap-2">
          <AddIncome>
            <Button className="h-12 w-full rounded-full">Adicionar Receita</Button>
          </AddIncome>
        </div>
      </div>
    </div>
  );
}


