import AddPersonalExpense from "@/app/_components/dialogs/add-personal-expense";
import { listPersonalExpenses } from "@/server/queries/personal-expense-queries";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import Header from "../_components/header";
import { DateRangePicker } from "@/app/_components/date-picker";
import { ptBR } from "date-fns/locale";
import EditPersonalExpense from "@/app/_components/dialogs/edit-personal-expense";
import type { PersonalExpense } from "@/server/db/schema/personal-expense";

export default async function DespesasPessoaisPage({
  searchParams,
}: {
  searchParams: Promise<{ date: string }>;
}) {
  const { date } = await searchParams;
  const personalExpenses = await listPersonalExpenses(date);
  return (
    <div className="flex min-h-screen flex-col pb-5">
      <div>
        <Header className="flex-none">
          <div className="hidden sm:block">
            <AddPersonalExpense />
          </div>
          <div className="sm:hidden"></div>
        </Header>
        <DateRangePicker />
      </div>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <div className="mx-auto w-full divide-y">
          {personalExpenses.map((expense) => (
            <EditPersonalExpense data={expense} key={expense.id}>
              <div className="active:bg-accent flex cursor-pointer justify-between gap-4 py-2">
                <p>
                  {format(parseISO(expense.date), "dd MMM", {
                    locale: ptBR,
                  }).toUpperCase()}
                </p>
                <p>{formatCurrency(expense.value)}</p>
              </div>
            </EditPersonalExpense>
          ))}
        </div>
      </main>
      <div className="block w-full px-5 sm:hidden">
        <AddPersonalExpense className="w-full" />
      </div>
    </div>
  );
}
