import AddStoreExpense from "@/app/_components/dialogs/add/add-store-expense";
import ExpensesList from "@/app/_components/lists/expenses-list";
import { getExpensesByPeriod } from "@/server/queries/expense-queries";
import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import { Button } from "@/components/ui/button";

export default async function DespesasLojaPage({
  searchParams,
}: {
  searchParams: Promise<{ from: string; to: string }>;
}) {
  const { from, to } = await searchParams;
  const expensesPromise = getExpensesByPeriod({
    source: "store",
    start: from,
    end: to,
  });

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <Header className="sticky top-0 z-50 flex-none">
        <div className="hidden sm:block">
          <AddStoreExpense>
            <Button className="rounded-full">Adicionar</Button>
          </AddStoreExpense>
        </div>
      </Header>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-3">
        <section>
          <Suspense fallback={<Loading />}>
            <ExpensesList expensesPromise={expensesPromise} />
          </Suspense>
        </section>
      </main>
      <div className="fixed bottom-24 block w-full px-5 sm:hidden">
        <AddStoreExpense>
          <Button className="h-12 w-full rounded-full">
            Adicionar Despesa da Loja
          </Button>
        </AddStoreExpense>
      </div>
    </div>
  );
}
