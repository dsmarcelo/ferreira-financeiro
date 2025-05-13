"use client";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { startTransition, use } from "react";
import { formatCurrency } from "@/lib/utils";
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

import { actionToggleExpenseIsPaid } from "@/actions/expense-actions";

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {/* <DownloadButton isPending={isPending} onClick={handleDownload} />
        <ShareButton isPending={isPending} onClick={handleShare} /> */}
        <span className="ml-auto font-bold">
          Total: {formatCurrency(total)}
        </span>
        <span className="font-bold text-green-600">
          Pago: {formatCurrency(totalPaid)}
        </span>
      </div>
      {sortedDates.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          Nenhuma despesa encontrada.
        </div>
      )}
      {sortedDates.map((date) => (
        <div key={date}>
          <div className="text-muted-foreground mt-4 mb-2 text-xs font-semibold uppercase">
            {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </div>
          <div className="divide-border bg-card divide-y rounded-lg border">
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
  );
}
