import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditPersonalExpense from "../dialogs/edit-personal-expense";
import { cn, formatCurrency } from "@/lib/utils";
import type { PersonalExpense } from "@/server/db/schema/personal-expense";
import { use } from "react";
import { Switch } from "@/components/ui/switch";

// Helper to group expenses by date string (YYYY-MM-DD)
function groupByDate(expenses: PersonalExpense[]) {
  return expenses.reduce<Record<string, PersonalExpense[]>>((acc, expense) => {
    const date = expense.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(expense);
    return acc;
  }, {});
}
// TODO: Update all the other lists to match this component
export default function PersonalExpensesList({
  personalExpenses,
}: {
  personalExpenses: Promise<PersonalExpense[]>;
}) {
  const allPersonalExpenses = use(personalExpenses);
  const grouped = groupByDate(allPersonalExpenses);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="mx-auto w-full divide-y">
      {/* Iterate over each date group */}
      {sortedDates.map((date) => (
        <div key={date} className="py-1">
          {/* Date label, styled as in the image */}
          <div className="flex gap-1">
            <p className="w-fit whitespace-nowrap text-sm font-light py-1">
              {format(parseISO(date), "dd MMM", { locale: ptBR }).toUpperCase()}
            </p>
            <div className="flex flex-col justify-between w-full gap-1">
              {grouped[date]?.map((expense) => (
                <EditPersonalExpense data={expense} key={expense.id}>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-background-secondary active:bg-accent rounded-md px-2 py-0.5">
                    <p className="flex-1 text-black/80 break-words">{expense.description}</p>
                    <div className="flex items-center gap-1">
                      <div className={cn("w-2 h-2 rounded-full", expense.isPaid && "bg-green-500")} />
                      <p className="w-fit text-right whitespace-nowrap">{formatCurrency(expense.value)}</p>
                    </div>
                  </div>
                </EditPersonalExpense>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
