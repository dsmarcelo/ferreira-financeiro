import AddStoreExpense from "@/app/_components/dialogs/add-store-expense";
import { listStoreExpenses } from "@/server/queries/store-expense-queries";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import Header from "../_components/header";
import { DateRangePicker } from "@/app/_components/date-picker";
import { ptBR } from "date-fns/locale";
import EditStoreExpense from "@/app/_components/dialogs/edit-store-expense";
import type { StoreExpense } from "@/server/db/schema/store-expense";

export default async function DespesasLojaPage({
  searchParams,
}: {
  searchParams: Promise<{ date: string }>;
}) {
  const { date } = await searchParams;
  const storeExpenses = await listStoreExpenses(date);
  return (
    <div className="flex min-h-screen flex-col pb-5">
      <div>
        <Header className="flex-none">
          <div className="hidden sm:block">
            <AddStoreExpense />
          </div>
          <div className="sm:hidden"></div>
        </Header>
        <DateRangePicker />
      </div>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <div className="mx-auto w-full divide-y">
          {storeExpenses.map((expense) => (
            <EditStoreExpense data={expense} key={expense.id}>
              <div className="active:bg-accent flex cursor-pointer justify-between gap-4 py-2">
                <p>
                  {format(parseISO(expense.date), "dd MMM", {
                    locale: ptBR,
                  }).toUpperCase()}
                </p>
                <p>{formatCurrency(expense.value)}</p>
              </div>
            </EditStoreExpense>
          ))}
        </div>
      </main>
      <div className="block w-full px-5 sm:hidden">
        <AddStoreExpense className="w-full" />
      </div>
    </div>
  );
}
