"use client";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { startTransition, use } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { ExpenseListItem } from "./expense-list-item";
import { useOptimistic } from "react";
import type { Expense } from "@/server/db/schema/expense-schema";

function groupByDate(expenses: Expense[]) {
  return expenses
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.id - b.id;
    })
    .reduce<Record<string, Expense[]>>((acc, expense) => {
      const date = expense.date;
      acc[date] ??= [];
      acc[date].push(expense);
      return acc;
    }, {});
}

function sumExpensesByDate(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + Number(expense.value), 0);
}

import { actionToggleExpenseIsPaid } from "@/actions/expense-actions";
import DownloadButton from "../buttons/download-button";
import ShareButton from "../buttons/share-button";
import { Dot } from "lucide-react";

export default function ExpensesList({
  expensesPromise,
}: {
  expensesPromise: Promise<Expense[]>;
}) {
  const allExpenses = use(expensesPromise);
  const [optimisticExpenses, setOptimisticExpenses] = useOptimistic(
    allExpenses,
    (state: Expense[], update: { id: number; checked: boolean }) =>
      state.map((expense) =>
        expense.id === update.id
          ? { ...expense, isPaid: update.checked }
          : expense,
      ),
  );

  if (!allExpenses) return <div>Nenhuma despesa encontrada</div>;

  // TODO: PDF actions (placeholder, adapt for product purchases if needed)
  // const [isPending, startTransition] = useTransition();
  // const handleDownload = () => {
  //   return;
  // }; // TODO
  // const handleShare = () => {
  //   return;
  // }; // TODO

  const handleTogglePaid = async (id: number, checked: boolean) => {
    startTransition(() => {
      setOptimisticExpenses({ id, checked });
    });
    try {
      await actionToggleExpenseIsPaid(id, checked);
    } catch {
      // Optionally show a toast or revert optimistic update
    }
  };

  const grouped = groupByDate(optimisticExpenses);

  const sortedDates = Object.keys(grouped).sort();

  const total = allExpenses.reduce(
    (acc, expense) => acc + Number(expense.value),
    0,
  );
  const totalPaid = allExpenses
    .filter((expense) => expense.isPaid)
    .reduce((acc, expense) => acc + Number(expense.value), 0);

  const totalUnpaid = total - totalPaid;

  function hasUnpaidExpenses(expenses: Expense[]) {
    return expenses.some((expense) => !expense.isPaid);
  }

  return (
    <div className="flex flex-col gap-4">
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
            // onClick={handleDownload}
            // disabled={isPending}
          />
          <ShareButton
            aria-label="Compartilhar PDF das despesas pessoais"
            // onClick={handleShare}
            // disabled={isPending}
          />
        </div>
      </div>

      {sortedDates.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          Nenhuma despesa encontrada.
        </div>
      )}
      <div className="space-y-4">
        {sortedDates.map((date) => (
          <div key={date}>
            <div className="text-muted-foreground flex items-center text-xs">
              <p
                className={cn(
                  "font-semibold uppercase",
                  new Date(date) < new Date() &&
                    hasUnpaidExpenses(grouped[date] ?? [])
                    ? "text-red-500"
                    : "text-primary",
                )}
              >
                {format(parseISO(date), "dd 'de' MMMM, EEE", { locale: ptBR })}
              </p>
              <Dot />
              <p>
                {formatCurrency(sumExpensesByDate(grouped[date] ?? []))}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {grouped[date]?.map((expense) => (
                <ExpenseListItem
                  key={expense.id}
                  expense={expense}
                  onTogglePaid={handleTogglePaid}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
