"use client";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { startTransition, use } from "react";
import { cn, formatCurrency, getCategoryColorClasses } from "@/lib/utils";
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

function groupExpensesByCategory(
  expenses: Expense[],
): Record<string, Expense[]> {
  return expenses.reduce<Record<string, Expense[]>>((acc, expense) => {
    const categoryName = expense.category.name;
    acc[categoryName] ??= [];
    acc[categoryName].push(expense);
    return acc;
  }, {});
}

function sumExpensesByCategory(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + Number(expense.value), 0);
}

import { actionToggleExpenseIsPaid } from "@/actions/expense-actions";
import DownloadButton from "../buttons/download-button";
import ShareButton from "../buttons/share-button";
import { Dot } from "lucide-react";
import { downloadExpensesPDF, shareExpensesPDF } from "@/lib/pdf/expenses-pdf";
import { Badge } from "@/components/ui/badge";

export default function ExpensesList({
  expensesPromise,
}: {
  expensesPromise: Promise<Expense[]>;
}) {
  const allExpenses = use(expensesPromise);
  const [optimisticExpenses, setOptimisticExpenses] = useOptimistic(
    allExpenses,
    (
      state: Expense[],
      update: { id: number; checked: boolean; date: string; index: number },
    ) => {
      // Find the nth occurrence of the expense with the given date and index within its date group
      let occurrence = 0;
      return state.map((expense) => {
        if (expense.date === update.date) {
          if (occurrence === update.index) {
            occurrence++;
            return { ...expense, isPaid: update.checked };
          }
          occurrence++;
        }
        return expense;
      });
    },
  );

  if (!allExpenses) return <div>Nenhuma despesa encontrada</div>;

  const handleTogglePaid = async (
    id: number,
    checked: boolean,
    date: string,
    index: number,
  ) => {
    startTransition(() => {
      setOptimisticExpenses({ id, checked, date, index });
    });
    try {
      await actionToggleExpenseIsPaid(id, checked, date);
    } catch {
      // Optionally show a toast or revert optimistic update
    }
  };

  const grouped = groupByDate(optimisticExpenses);
  const groupedByCategory = groupExpensesByCategory(optimisticExpenses);

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
            aria-label="Baixar PDF das despesas"
            onClick={() => downloadExpensesPDF(allExpenses)}
            // disabled={isPending}
          />
          <ShareButton
            aria-label="Compartilhar PDF das despesas"
            onClick={() => shareExpensesPDF(allExpenses)}
            // disabled={isPending}
          />
        </div>
      </div>

      {/* Category Summary */}
      {Object.keys(groupedByCategory).length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-lg border p-4">
          {Object.entries(groupedByCategory)
            .sort(
              ([, a], [, b]) =>
                sumExpensesByCategory(b) - sumExpensesByCategory(a),
            )
            .map(([categoryName, categoryExpenses]) => (
              <div
                key={categoryName}
                className="flex items-center gap-2 text-sm"
              >
                <Badge
                  variant="secondary"
                  className={cn(
                    "flex items-center gap-1",
                    getCategoryColorClasses(
                      categoryExpenses[0]?.category?.color ?? "blue",
                    ),
                  )}
                >
                  <span className="text-shadow-md">
                    {categoryExpenses[0]?.category?.emoji ?? "💸"}
                  </span>
                  <span>{categoryName}:</span>
                  <span className="font-semibold">
                    {formatCurrency(sumExpensesByCategory(categoryExpenses))}
                  </span>
                </Badge>
              </div>
            ))}
        </div>
      )}

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
              <p>{formatCurrency(sumExpensesByDate(grouped[date] ?? []))}</p>
            </div>
            <div className="flex flex-col gap-2">
              {grouped[date]?.map((expense, index) => (
                <ExpenseListItem
                  key={`${expense.id}-${index}`}
                  expense={expense}
                  onTogglePaid={(id, checked) =>
                    handleTogglePaid(id, checked, date, index)
                  }
                  index={index}
                  date={date}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
