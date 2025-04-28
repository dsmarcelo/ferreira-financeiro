"use client";

import { GenericDataCalendar } from "./generic-data-calendar";

// Example store expense type
interface StoreExpense {
  id: string;
  amount: number;
  description: string;
  date: string | Date;
  isPaid: boolean;
  dueDate?: string | Date;
}

interface StoreExpenseCalendarClientProps {
  year: number;
  month: number; // 0-indexed
  expensesByDate: Record<string, StoreExpense>;
  className?: string;
}

/**
 * StoreExpenseCalendarClient - Client component for store expense calendar
 *
 * Shows expenses for each day with payment status indication.
 */
export default function StoreExpenseCalendarClient({
  year,
  month,
  expensesByDate,
  className,
}: StoreExpenseCalendarClientProps) {
  // Format the calendar day labels for store expenses
  const formatExpenseLabel = (_dateStr: string, expense: StoreExpense | null) => {
    if (!expense) return "+";

    // Format with payment status indicator
    const prefix = expense.isPaid ? "✓" : "!";
    return `${prefix} R$ ${Number(expense.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  // Render the appropriate dialog based on state
  const renderDialog = ({
    selectedDate,
    selectedItem,
    isDialogOpen,
    handleDialogClose,
  }: {
    selectedDate: string | null;
    selectedItem: StoreExpense | null;
    isDialogOpen: boolean;
    handleDialogClose: (open: boolean) => void;
  }) => {
    if (!selectedDate) return null;

    // This is a placeholder - in a real implementation, you would use actual dialog components
    if (selectedItem) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Edit Expense</h2>
            <p>Date: {selectedDate}</p>
            <p>Amount: R$ {selectedItem.amount}</p>
            <p>Description: {selectedItem.description}</p>
            <p>Status: {selectedItem.isPaid ? "Paid" : "Unpaid"}</p>
            <button
              className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
              onClick={() => handleDialogClose(false)}
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="w-96 rounded-lg bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Add Expense</h2>
          <p>Date: {selectedDate}</p>
          <button
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
            onClick={() => handleDialogClose(false)}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <GenericDataCalendar
      year={year}
      month={month}
      dataByDate={expensesByDate}
      formatLabel={formatExpenseLabel}
      renderDialog={renderDialog}
      className={className}
    />
  );
}