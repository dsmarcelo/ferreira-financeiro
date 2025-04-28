"use client";

import { useState } from "react";
import { BigCalendar, type CalendarDayData } from "./big-calendar";
import type { CashRegister } from "@/server/db/schema/cash-register";
import AddCashRegister from "../dialogs/add-cash-register";
import EditCashRegister from "../dialogs/edit-cash-register";

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Generate dayData for the calendar
  const dayData = buildCalendarDayData(
    year,
    month,
    cashRegisterByDate,
    (date, entry) => {
      setSelectedDate(date);
      setEditId(entry?.id ?? null);
      setIsDialogOpen(true);
    },
  );

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedDate(null);
      setEditId(null);
    }
  };

  // Render appropriate dialog based on state
  const renderDialog = () => {
    if (!selectedDate) return null;

    const entry = editId ? cashRegisterByDate[selectedDate] : null;

    if (entry) {
      return (
        <EditCashRegister
          data={entry}
          initialOpen={isDialogOpen}
          onOpenChange={handleDialogClose}
        >
          <span />
        </EditCashRegister>
      );
    }

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
    <div className={className}>
      <BigCalendar year={year} month={month} dayData={dayData} />
      {renderDialog()}
    </div>
  );
}

// Helper function to build calendar day data
function buildCalendarDayData(
  year: number,
  month: number,
  cashRegisterByDate: Record<string, CashRegister>,
  onDayClick: (dateStr: string, entry: CashRegister | null) => void,
): Record<string, CalendarDayData> {
  const result: Record<string, CalendarDayData> = {};

  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d);
    if (date.getMonth() !== month) break;

    const dateStr = date.toISOString().split("T")[0];
    if (!dateStr) continue;

    const entry = cashRegisterByDate[dateStr] ?? null;
    result[dateStr] = {
      label: entry
        ? `R$ ${Number(entry.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        : "+",
      onClick: () => onDayClick(dateStr, entry),
    };
  }

  return result;
}
