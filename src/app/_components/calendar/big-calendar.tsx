"use client";
import React, { useState } from "react";

// Format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  try {
    const isoDate = date.toISOString();
    return String(isoDate.split("T")[0]);
  } catch (e) {
    return ""; // Return empty string for invalid dates
  }
}

// Get all days to display in the calendar grid
function getCalendarDays(year: number, month: number) {
  // month: 0-indexed (0 = January)
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = lastDayOfMonth.getDate();

  // Previous month's days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
  const prevMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const day = prevMonthLastDay - firstDayOfWeek + i + 1;
    return {
      date: new Date(prevYear, prevMonth, day),
      currentMonth: false,
    };
  });

  // Current month's days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
    date: new Date(year, month, i + 1),
    currentMonth: true,
  }));

  // Next month's days
  const totalDays = prevMonthDays.length + currentMonthDays.length;
  const nextDaysCount = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonthDays = Array.from({ length: nextDaysCount }, (_, i) => ({
    date: new Date(nextYear, nextMonth, i + 1),
    currentMonth: false,
  }));

  return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
}

// Days of the week
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Calendar props
export interface CalendarDayData {
  label?: string;
  onClick?: () => void;
  data?: any; // Generic data for this day
}

export interface BigCalendarProps {
  year: number;
  month: number; // 0-indexed (0 = January)
  dayData?: Record<string, CalendarDayData>;
  className?: string;
}

/**
 * BigCalendar - A simple, reusable calendar grid component.
 *
 * Props:
 * - year: number (e.g., 2025)
 * - month: number (0 = January)
 * - dayData: Record<YYYY-MM-DD, { label?: string, onClick?: () => void, data?: any }>
 * - className: string (optional)
 */
export function BigCalendar({
  year,
  month,
  dayData = {},
  className = "",
}: BigCalendarProps) {
  const days = getCalendarDays(year, month);

  return (
    <div className={`mx-auto w-full max-w-3xl rounded-lg border ${className}`}>
      {/* Header */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 border-b">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-gray-200">
        {days.map(({ date, currentMonth }) => {
          const dateStr = formatDate(date);
          const data = dayData[dateStr] ?? {};

          const dayClasses = [
            "flex aspect-square flex-col gap-2 p-2",
            "border-none outline-none transition",
            currentMonth
              ? "bg-white text-gray-900"
              : "bg-gray-50 text-gray-300",
            data.onClick
              ? "cursor-pointer hover:bg-blue-100"
              : "cursor-default",
          ].join(" ");

          return (
            <button
              key={dateStr}
              type="button"
              onClick={data.onClick}
              className={dayClasses}
              aria-label={
                data.label
                  ? `${date.getDate()}: ${data.label}`
                  : `${date.getDate()}`
              }
              disabled={!data.onClick}
            >
              <p className="text-sm font-medium text-left">{date.getDate()}</p>
              {data.label && (
                <p
                  className="w-full truncate rounded-sm py-0.5 bg-accent text-xs text-blue-600"
                  title={data.label}
                >
                  {data.label}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Generic helper function to build calendar day data for any data type
 *
 * @param year The calendar year
 * @param month The calendar month (0-indexed)
 * @param dataByDate Record of data indexed by YYYY-MM-DD date strings
 * @param formatLabel Function to format the label for each day
 * @param onDayClick Callback for day clicks
 * @returns Record of CalendarDayData indexed by date
 */
export function buildCalendarDayData<T>(
  year: number,
  month: number,
  dataByDate: Record<string, T>,
  formatLabel: (dateStr: string, entry: T | null) => string,
  onDayClick: (dateStr: string, entry: T | null) => void,
): Record<string, CalendarDayData> {
  const result: Record<string, CalendarDayData> = {};

  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d);
    if (date.getMonth() !== month) break;

    const dateStr = formatDate(date);
    if (!dateStr) continue;

    const entry = dataByDate[dateStr] ?? null;
    result[dateStr] = {
      label: formatLabel(dateStr, entry),
      onClick: () => onDayClick(dateStr, entry),
      data: entry
    };
  }

  return result;
}

/**
 * Hook for managing calendar interactions and dialogs
 *
 * @returns Object with state values and handlers for calendar interactions
 */
export function useCalendarInteraction() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedDate(null);
      setSelectedItem(null);
    }
  };

  // Handle day click
  const handleDayClick = (dateStr: string, item: any | null) => {
    setSelectedDate(dateStr);
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return {
    selectedDate,
    selectedItem,
    isDialogOpen,
    handleDialogClose,
    handleDayClick,
  };
}

// Usage example (remove before production):
// <BigCalendar
//   year={2025}
//   month={3} // April (0-indexed)
//   dayData={{
//     '2025-04-04': { label: 'Annual Planning', onClick: () => alert('Clicked 4th!') },
//     '2025-04-19': { label: 'Project Deadline', onClick: () => alert('Clicked 19th!') },
//   }}
// />
