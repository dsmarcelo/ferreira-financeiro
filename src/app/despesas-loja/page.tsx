import AddStoreExpense from "@/app/_components/dialogs/add/add-store-expense";
import { listStoreExpenses } from "@/server/queries/store-expense-queries";
import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import StoreExpensesList from "@/app/_components/lists/store-expenses-list";

export default async function DespesasLojaPage({
  searchParams,
}: {
  searchParams: Promise<{ date: string }>;
}) {
  const { date } = await searchParams;
  const storeExpenses = listStoreExpenses(date);
  return (
    <div className="flex min-h-screen flex-col pb-5">
      <div>
        <Header className="flex-none">
          <div className="hidden sm:block">
            <AddStoreExpense />
          </div>
          <div className="sm:hidden"></div>
        </Header>
      </div>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <Suspense fallback={<Loading />}>
          <StoreExpensesList storeExpenses={storeExpenses} />
        </Suspense>
      </main>
      <div className="block w-full px-5 sm:hidden">
        <AddStoreExpense className="w-full" />
      </div>
    </div>
  );
}
