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
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
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

  // Map entries by date for quick lookup
  const byDate: Record<string, CashRegister> = {};
  for (const entry of entries) {
    // Extract date string, checking for valid date
    if (entry.date) {
      try {
        // Handle date formatting consistently
        const dateStr = String(entry.date).split("T")[0];
        // Ensure we have a valid date string
        if (dateStr && dateStr.length > 0) {
          byDate[dateStr] = entry;
        }
      } catch (e) {
        console.error("Failed to format date:", entry.date);
      }
    }
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
