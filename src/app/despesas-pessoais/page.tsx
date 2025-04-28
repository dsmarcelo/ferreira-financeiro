import AddPersonalExpense from "@/app/_components/dialogs/add-personal-expense";
import { listPersonalExpenses } from "@/server/queries/personal-expense-queries";
import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import PersonalExpensesList from "../_components/lists/personal-expenses-list";

export default async function DespesasPessoaisPage({
  searchParams,
}: {
  searchParams: Promise<{ date: string }>;
}) {
  const { date } = await searchParams;
  const personalExpenses = listPersonalExpenses(date);

  return (
    <div className="flex min-h-screen flex-col pb-5">
      <div>
        <Header className="flex-none">
          <div className="hidden sm:block">
            <AddPersonalExpense />
          </div>
          <div className="sm:hidden"></div>
        </Header>
      </div>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <Suspense fallback={<Loading />}>
          <PersonalExpensesList personalExpenses={personalExpenses} />
        </Suspense>
      </main>
      <div className="block w-full px-5 sm:hidden">
        <AddPersonalExpense className="w-full" />
      </div>
    </div>
  );
}
