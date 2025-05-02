"use client";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditStoreExpense from "../dialogs/edit/edit-store-expense";
import { formatCurrency } from "@/lib/utils";
import { ExpenseListItem } from "./expense-list-item";
import { actionToggleStoreExpenseIsPaid } from "@/actions/store-expense-actions";
import type { StoreExpense } from "@/server/db/schema/store-expense";
import { use } from "react";
import DownloadButton from "../buttons/download-button";
import ShareButton from "../buttons/share-button";

// Helper to group expenses by date string (YYYY-MM-DD)
function groupByDate(expenses: StoreExpense[]) {
  return expenses
    .sort((a, b) =>
      a.date === b.date
        ? a.id.localeCompare(b.id)
        : a.date.localeCompare(b.date),
    )
    .reduce<Record<string, StoreExpense[]>>((acc, expense) => {
      const date = expense.date;
      acc[date] ??= [];
      acc[date].push(expense);
      return acc;
    }, {});
}

/**
 * Renders a list of store expenses.
 * Uses Suspense for loading states. Receives a promise of StoreExpense[].
 */
export default function StoreExpensesList({
  storeExpenses,
}: {
  storeExpenses: Promise<StoreExpense[]>;
}) {
  const allStoreExpenses = use(storeExpenses);
  const grouped = groupByDate(allStoreExpenses);
  const sortedDates = Object.keys(grouped).sort();

  const total = allStoreExpenses.reduce(
    (acc, item) => acc + Number(item.value),
    0,
  );
  const totalPaid = allStoreExpenses.filter((item) => item.isPaid).reduce((acc, item) => acc + Number(item.value), 0);
  const totalUnpaid = total - totalPaid;

  if (allStoreExpenses.length === 0) {
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
        {sortedDates.map((date) => (
          <div key={date} className="py-2">
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
                      (acc, item) => acc + Number(item.value),
                      0,
                    ) ?? 0,
                  )}
                  )
                </p>
              </div>
              <div className="flex w-full flex-col justify-between divide-y divide-gray-100">
                {grouped[date]?.map((item) => (
                  <EditStoreExpense data={item} key={item.id}>
                    <div>
                      <ExpenseListItem
                        expense={item}
                        onTogglePaid={(id: string, checked: boolean) => {
                          void actionToggleStoreExpenseIsPaid(id, checked);
                        }}
                      />
                    </div>
                  </EditStoreExpense>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
