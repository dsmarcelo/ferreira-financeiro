import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditStoreExpense from "../dialogs/edit/edit-store-expense";
import { formatCurrency } from "@/lib/utils";
import type { StoreExpense } from "@/server/db/schema/store-expense";
import { use } from "react";

// Helper to group expenses by date string (YYYY-MM-DD)
function groupByDate(expenses: StoreExpense[]) {
  return expenses.reduce<Record<string, StoreExpense[]>>((acc, expense) => {
    const date = expense.date;
    if (!acc[date]) acc[date] = [];
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

  return (
    <div className="mx-auto w-full divide-y">
      {/* Iterate over each date group */}
      {sortedDates.map((date) => (
        <div key={date} className="py-1">
          {/* Date label, styled as in the image */}
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
            <span className="w-12">
              {format(parseISO(date), "dd MMM", { locale: ptBR }).toUpperCase()}
            </span>
            {/* Only show the first description inline, others below */}
            <span className="flex-1 font-normal text-black/80">
              {grouped[date]?.[0]?.description ?? ""}
            </span>
            <span className="min-w-[80px] text-right font-medium">
              {formatCurrency(grouped[date]?.[0]?.value ?? 0)}
            </span>
          </div>
          {/* Render additional descriptions for this date, if any */}
          {(grouped[date]?.slice(1) ?? []).map((expense) => (
            <EditStoreExpense data={expense} key={expense.id}>
              <div className="text-muted-foreground flex items-center gap-2 pl-12 text-xs font-medium">
                <span className="flex-1 font-normal text-black/80">
                  {expense.description}
                </span>
                <span className="min-w-[80px] text-right font-medium">
                  {formatCurrency(expense.value)}
                </span>
              </div>
            </EditStoreExpense>
          ))}
        </div>
      ))}
    </div>
  );
}
