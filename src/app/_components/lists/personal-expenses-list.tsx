import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditPersonalExpense from "../dialogs/edit-personal-expense";
import { formatCurrency } from "@/lib/utils";
import type { PersonalExpense } from "@/server/db/schema/personal-expense";
import { use } from "react";

export default function PersonalExpensesList({
  personalExpenses,
}: {
  personalExpenses: Promise<PersonalExpense[]>;
}) {
  const allPersonalExpenses = use(personalExpenses);

  return (
    <div className="mx-auto w-full divide-y">
      {allPersonalExpenses.map((expense) => (
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
  );
}
