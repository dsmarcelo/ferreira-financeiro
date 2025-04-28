import { actionListCashRegisters } from "@/actions/cash-register-actions";
import { BigCalendar } from "./big-calendar";
import type { CashRegister } from "@/server/db/schema/cash-register";
import { Suspense } from "react";
import CashRegisterCalendarClient from "./cash-register-calendar.client";
// import CashRegisterCalendarClient from './cash-register-calendar.client'
// TODO: Implement CashRegisterCalendarClient as a client component to handle dialogs and calendar UI

// Helper to get the first and last day of a month as YYYY-MM-DD
function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const toStr = (d: Date) => d.toISOString().split("T")[0];
  return { start: toStr(start), end: toStr(end) };
}

interface CashRegisterCalendarProps {
  year: number;
  month: number; // 0-indexed
  className?: string;
}

/**
 * CashRegisterCalendar - Server component that fetches cash register data and renders the calendar.
 */
export default async function CashRegisterCalendar({
  year,
  month,
  className,
}: CashRegisterCalendarProps) {
  const { start, end } = getMonthRange(year, month);
  // Fetch all cash register entries for the month
  const entries: CashRegister[] = await actionListCashRegisters(start, end);

  // Map entries by date for quick lookup
  const byDate: Record<string, CashRegister> = {};
  for (const entry of entries) {
    // Normalize entry.date to YYYY-MM-DD
    const dateKey =
      typeof entry.date === "string"
        ? entry.date
        : entry.date instanceof Date
          ? entry.date.toISOString().split("T")[0]
          : "";
    if (!dateKey) continue;
    byDate[dateKey] = entry;
  }

  return (
    <Suspense fallback={<div>Carregando calendário...</div>}>
      <CashRegisterCalendarClient
        year={year}
        month={month}
        cashRegisterByDate={byDate}
        className={className}
      />
    </Suspense>
  );
}
