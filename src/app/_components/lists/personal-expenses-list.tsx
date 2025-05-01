import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditPersonalExpense from "../dialogs/edit/edit-personal-expense";
import { cn, formatCurrency } from "@/lib/utils";
import type { PersonalExpense } from "@/server/db/schema/personal-expense";
import { use } from "react";
import DownloadButton from "../buttons/download-button";
import ShareButton from "../buttons/share-button";

// Helper to group expenses by date string (YYYY-MM-DD)
function groupByDate(expenses: PersonalExpense[]) {
  return expenses.reduce<Record<string, PersonalExpense[]>>((acc, expense) => {
    const date = expense.date;
    acc[date] ??= [];
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

  const total = allPersonalExpenses.reduce(
    (acc, expense) => acc + Number(expense.value),
    0,
  );

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p>Total do mês</p>
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        </div>
        <div className="flex gap-2">
          <DownloadButton />
          <ShareButton />
        </div>
      </div>
      <div className="mx-auto w-full divide-y">
        {/* Iterate over each date group */}
        {sortedDates.map((date) => (
          <div key={date} className="py-1">
            {/* Date label, styled as in the image */}
            <div className="flex gap-1">
              <p className="w-fit py-1 text-sm font-light whitespace-nowrap">
                {format(parseISO(date), "dd MMM", {
                  locale: ptBR,
                }).toUpperCase()}
              </p>
              <div className="flex w-full flex-col justify-between gap-1">
                {grouped[date]?.map((expense) => (
                  <EditPersonalExpense data={expense} key={expense.id}>
                    <div className="hover:bg-background-secondary active:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-0.5">
                      <p className="flex-1 break-words text-black/80">
                        {expense.description}
                      </p>
                      <div className="flex items-center gap-1">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            expense.isPaid && "bg-green-500",
                          )}
                        />
                        <p className="w-fit text-right whitespace-nowrap">
                          {formatCurrency(expense.value)}
                        </p>
                      </div>
                    </div>
                  </EditPersonalExpense>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
