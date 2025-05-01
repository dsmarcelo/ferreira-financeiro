"use client";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditPersonalExpense from "../dialogs/edit/edit-personal-expense";
import { cn, formatCurrency } from "@/lib/utils";
import type { PersonalExpense } from "@/server/db/schema/personal-expense";
import { use } from "react";
import DownloadButton from "../buttons/download-button";
import ShareButton from "../buttons/share-button";
import { Checkbox } from "@/components/ui/checkbox";
import { actionTogglePersonalExpenseIsPaid } from "@/actions/personal-expense-actions";

// Helper to group expenses by date string (YYYY-MM-DD)
function groupByDate(expenses: PersonalExpense[]) {
  return expenses
    .sort((a, b) =>
      a.date === b.date
        ? a.id.localeCompare(b.id)
        : a.date.localeCompare(b.date),
    )
    .reduce<Record<string, PersonalExpense[]>>((acc, expense) => {
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

  const totalPaid = allPersonalExpenses
    .filter((expense) => expense.isPaid)
    .reduce((acc, expense) => acc + Number(expense.value), 0);

  const totalUnpaid = total - totalPaid;

  if (allPersonalExpenses.length === 0) {
    return <p>Nenhum resultado encontrado para o mês selecionado</p>;
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="sm:border-r sm:pr-2">
            <p>Total do mês</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          </div>
          <div className="flex divide-x">
            <div className="pr-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <p className="text-sm">Total pago</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="pl-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <p className="text-sm">Total pendente</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totalUnpaid)}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <DownloadButton />
          <ShareButton />
        </div>
      </div>
      <div className="mx-auto w-full divide-y">
        {/* Iterate over each date group */}
        {sortedDates.map((date) => (
          <div key={date} className="py-2">
            {/* Date label, styled as in the image */}
            <div className="flex flex-col">
              <div className="text-muted-foreground font-base flex w-fit items-center justify-between gap-2 text-xs whitespace-nowrap">
                <p>
                  {format(parseISO(date), "dd MMM", {
                    locale: ptBR,
                  }).toUpperCase()}
                </p>
                <p>
                  (
                  {formatCurrency(
                    grouped[date]?.reduce(
                      (acc, expense) => acc + Number(expense.value),
                      0,
                    ) ?? 0,
                  )}
                  )
                </p>
              </div>
              <div className="flex w-full flex-col justify-between divide-y divide-gray-100">
                {grouped[date]?.map((expense) => (
                  <EditPersonalExpense data={expense} key={expense.id}>
                    <div
                      className={cn(
                        "hover:bg-background-secondary active:bg-accent flex cursor-pointer items-center gap-2 py-2",
                        expense.isPaid && "",
                      )}
                    >
                      <div className="flex w-full items-center gap-2">
                        <Checkbox
                          className="h-6 w-6 active:bg-slate-500"
                          checked={expense.isPaid}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={(checked) => {
                            void actionTogglePersonalExpenseIsPaid(
                              expense.id,
                              checked as boolean,
                            );
                          }}
                        />
                        <p className="flex-1 break-words">
                          {expense.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <p
                          className={cn(
                            "w-fit text-right whitespace-nowrap",
                            expense.isPaid && "line-through-gray",
                          )}
                        >
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
