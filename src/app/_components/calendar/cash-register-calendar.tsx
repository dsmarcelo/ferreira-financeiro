import { actionListCashRegisters } from "@/actions/cash-register-actions";
import type { CashRegister } from "@/server/db/schema/cash-register";
import { Suspense } from "react";
import CashRegisterCalendarClient from "./cash-register-calendar.client";
// import CashRegisterCalendarClient from './cash-register-calendar.client'
// TODO: Implement CashRegisterCalendarClient as a client component to handle dialogs and calendar UI

interface CashRegisterCalendarProps {
  year: number;
  month: number; // 0-indexed
  className?: string;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * CashRegisterCalendar - Server component that fetches cash register data and renders the calendar.
 */
export default async function CashRegisterCalendar({
  year,
  month,
  className,
  searchParams,
}: CashRegisterCalendarProps) {
  // Get the date range from searchParams
  const start = (await searchParams)?.from || "";
  const end = (await searchParams)?.to || "";

  // Fetch all cash register entries for the month
  const entries: CashRegister[] = await actionListCashRegisters(start, end);

  // Group entries by date into arrays
  const byDate: Record<string, CashRegister[]> = {};
  for (const entry of entries) {
    if (!entry.date) continue;
    // Get YYYY-MM-DD string
    let dateStr: string;
    try {
      dateStr = String(entry.date).split("T")[0];
    } catch {
      continue;
    }
    if (!dateStr) continue;
    if (!byDate[dateStr]) {
      byDate[dateStr] = [];
    }
    byDate[dateStr].push(entry);
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
