"use client";

import type { CashRegister } from "@/server/db/schema/cash-register";
import AddCashRegister from "../dialogs/add-cash-register";
import EditCashRegister from "../dialogs/edit-cash-register";
import { GenericDataCalendar } from "./generic-data-calendar";

interface CashRegisterCalendarClientProps {
  year: number;
  month: number; // 0-indexed
  cashRegisterByDate: Record<string, CashRegister>;
  className?: string;
}

/**
 * CashRegisterCalendarClient - Client component for calendar UI and dialogs.
 *
 * Shows the cash value for each day, and opens the correct dialog on click.
 */
export default function CashRegisterCalendarClient({
  year,
  month,
  cashRegisterByDate,
  className,
}: CashRegisterCalendarClientProps) {
  // Format the calendar day labels for cash register data
  const formatCashLabel = (_dateStr: string, entry: CashRegister | null) => {
    if (!entry) return null;
    return `R$ ${Number(entry.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  // Render the appropriate dialog based on state
  const renderDialog = ({
    selectedDate,
    selectedItem,
    isDialogOpen,
    handleDialogClose,
  }: {
    selectedDate: string | null;
    selectedItem: CashRegister | null;
    isDialogOpen: boolean;
    handleDialogClose: (open: boolean) => void;
  }) => {
    if (!selectedDate) return null;

    // If we have an item, it's an edit operation
    if (selectedItem) {
      return (
        <EditCashRegister
          data={selectedItem}
          initialOpen={isDialogOpen}
          onOpenChange={handleDialogClose}
        >
          <span />
        </EditCashRegister>
      );
    }

    // Otherwise it's an add operation
    return (
      <AddCashRegister
        key={selectedDate}
        defaultDate={selectedDate}
        initialOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
      />
    );
  };

  return (
    <GenericDataCalendar
      year={year}
      month={month}
      dataByDate={cashRegisterByDate}
      formatLabel={formatCashLabel}
      renderDialog={renderDialog}
      className={className}
    />
  );
}
