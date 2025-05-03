"use client";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditPersonalExpense from "../dialogs/edit/edit-personal-expense";
import { formatCurrency } from "@/lib/utils";
import type { PersonalExpense } from "@/server/db/schema/personal-expense";
import { useCallback, Suspense, use, useTransition } from "react";
import DownloadButton from "../buttons/download-button";
import ShareButton from "../buttons/share-button";
import {
  downloadPersonalExpensesPDF,
  sharePersonalExpensesPDF,
} from "@/lib/pdf/expenses-pdf";
import { getSelectedMonth } from "@/lib/utils";
import { actionTogglePersonalExpenseIsPaid } from "@/actions/personal-expense-actions";
import { ExpenseListItem } from "./expense-list-item";

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
import { useOptimistic } from "react";

export default function PersonalExpensesList({
  personalExpenses,
}: {
  personalExpenses: Promise<PersonalExpense[]>;
}) {
  const allPersonalExpenses = use(personalExpenses);
  const selectedMonth = getSelectedMonth();

  // PDF actions
  const [isPending, startTransition] = useTransition();
  const handleDownload = useCallback(() => {
    startTransition(() => {
      downloadPersonalExpensesPDF(
        allPersonalExpenses,
        `Despesas Pessoais - ${selectedMonth}`,
      );
    });
  }, [allPersonalExpenses, selectedMonth]);
  const handleShare = useCallback(() => {
    startTransition(() => {
      void sharePersonalExpensesPDF(
        allPersonalExpenses,
        `Despesas Pessoais - ${selectedMonth}`,
      );
    });
  }, [allPersonalExpenses, selectedMonth]);

  // useOptimistic for optimistic expense updates
  const [optimisticExpenses, setOptimisticExpenses] = useOptimistic(
    allPersonalExpenses,
    (state: PersonalExpense[], update: { id: string; checked: boolean }) =>
      state.map((expense) =>
        expense.id === update.id
          ? { ...expense, isPaid: update.checked }
          : expense,
      ),
  );

  const grouped = groupByDate(optimisticExpenses);
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
    <Suspense fallback={<p>Carregando...</p>}>
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
          <DownloadButton
            aria-label="Baixar PDF das despesas pessoais"
            onClick={handleDownload}
            disabled={isPending}
          />
          <ShareButton
            aria-label="Compartilhar PDF das despesas pessoais"
            onClick={handleShare}
            disabled={isPending}
          />
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
                    <div>
                      <ExpenseListItem
                        expense={expense}
                        onTogglePaid={(id: string, checked: boolean) => {
                          startTransition(() => {
                            setOptimisticExpenses({ id, checked });
                          });
                          void actionTogglePersonalExpenseIsPaid(id, checked);
                        }}
                      />
                    </div>
                  </EditPersonalExpense>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Suspense>
  );
}
