import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditStoreExpense from "../dialogs/edit-store-expense";
import { formatCurrency } from "@/lib/utils";
import type { StoreExpense } from "@/server/db/schema/store-expense";
import { use } from "react";

/**
 * Renders a list of store expenses.
 * Uses Suspense for loading states. Receives a promise of StoreExpense[].
 */
export default function StoreExpensesList({
  storeExpenses,
}: {
  storeExpenses: Promise<StoreExpense[]>;
}) {
  // Resolve the promise to get the data array
  const allStoreExpenses = use(storeExpenses);

  return (
    <div className="mx-auto w-full divide-y">
      {allStoreExpenses.map((expense) => (
        <EditStoreExpense data={expense} key={expense.id}>
          <div className="active:bg-accent flex cursor-pointer justify-between gap-4 py-2">
            <p>
              {format(parseISO(expense.date), "dd MMM", {
                locale: ptBR,
              }).toUpperCase()}
            </p>
            <p>{formatCurrency(expense.value)}</p>
          </div>
        </EditStoreExpense>
      ))}
    </div>
  );
}
