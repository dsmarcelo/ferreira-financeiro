"use client";
import React from "react";

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
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
 * - dayData: Record<YYYY-MM-DD, { label?: string, onClick?: () => void }>
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
      <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-gray-500">
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
            "flex aspect-square flex-col items-center justify-center p-1",
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
              <span className="text-sm font-medium">{date.getDate()}</span>
              {data.label && (
                <span
                  className="mt-1 w-full truncate text-xs text-blue-600"
                  title={data.label}
                >
                  {data.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
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
