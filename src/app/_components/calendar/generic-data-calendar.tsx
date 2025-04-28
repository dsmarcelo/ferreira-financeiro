"use client";

import React from "react";
import { BigCalendar, buildCalendarDayData, useCalendarInteraction } from "./big-calendar";

/**
 * Props for the generic data calendar component
 */
export interface GenericDataCalendarProps<T> {
  year: number;
  month: number; // 0-indexed
  dataByDate: Record<string, T>;
  formatLabel: (dateStr: string, item: T | null) => string;
  renderDialog: (props: {
    selectedDate: string | null;
    selectedItem: T | null;
    isDialogOpen: boolean;
    handleDialogClose: (open: boolean) => void;
  }) => React.ReactNode;
  className?: string;
}

/**
 * GenericDataCalendar - A reusable calendar component for displaying any type of date-based data
 *
 * This component handles the calendar UI and interaction logic, while allowing
 * customization of how data is displayed and edited through renderDialog.
 *
 * @example
 * ```tsx
 * <GenericDataCalendar
 *   year={2025}
 *   month={3}
 *   dataByDate={storeExpensesByDate}
 *   formatLabel={(_, expense) => expense ? `R$ ${expense.amount}` : "+"}
 *   renderDialog={({ selectedDate, selectedItem, isDialogOpen, handleDialogClose }) => (
 *     selectedItem ? (
 *       <EditExpenseDialog
 *         data={selectedItem}
 *         open={isDialogOpen}
 *         onOpenChange={handleDialogClose}
 *       />
 *     ) : (
 *       <AddExpenseDialog
 *         defaultDate={selectedDate || ""}
 *         open={isDialogOpen}
 *         onOpenChange={handleDialogClose}
 *       />
 *     )
 *   )}
 * />
 * ```
 */
export function GenericDataCalendar<T>({
  year,
  month,
  dataByDate,
  formatLabel,
  renderDialog,
  className,
}: GenericDataCalendarProps<T>) {
  // Use the calendar interaction hook
  const interaction = useCalendarInteraction();

  // Generate calendar day data
  const dayData = buildCalendarDayData(
    year,
    month,
    dataByDate,
    formatLabel,
    interaction.handleDayClick
  );

  return (
    <div className={className}>
      <BigCalendar year={year} month={month} dayData={dayData} />
      {renderDialog(interaction)}
    </div>
  );
}

// Export a helper type for creating specific calendar implementations
export type CalendarImplementation<T> = (props: {
  year: number;
  month: number;
  className?: string;
}) => React.ReactNode;