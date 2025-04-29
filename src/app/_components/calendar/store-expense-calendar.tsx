import { Suspense } from "react";
import StoreExpenseCalendarClient from "./store-expense-calendar.client";

// Example store expense type (same as in client component)
interface StoreExpense {
  id: string;
  amount: number;
  description: string;
  date: string | Date;
  isPaid: boolean;
  dueDate?: string | Date;
}

interface StoreExpenseCalendarProps {
  year: number;
  month: number; // 0-indexed
  className?: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

/**
 * StoreExpenseCalendar - Server component that fetches store expense data and renders the calendar.
 *
 * This is an example implementation that would fetch real data from the database in a production app.
 */
export default async function StoreExpenseCalendar({
  year,
  month,
  className,
  searchParams = {},
}: StoreExpenseCalendarProps) {
  // Get the date range from searchParams
  const start = (searchParams.from as string) || "";
  const end = (searchParams.to as string) || "";

  // This would be a real database query in production
  // const entries = await actionListStoreExpenses(start, end);

  // For demonstration, we'll use mock data
  const mockEntries: StoreExpense[] = generateMockExpenses(year, month);

  // Map entries by date for quick lookup
  const byDate: Record<string, StoreExpense> = {};
  for (const entry of mockEntries) {
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
    <Suspense fallback={<div>Carregando calendário de despesas...</div>}>
      <StoreExpenseCalendarClient
        year={year}
        month={month}
        expensesByDate={byDate}
        className={className}
      />
    </Suspense>
  );
}

// Helper to generate mock expense data for demonstration
function generateMockExpenses(year: number, month: number): StoreExpense[] {
  const result: StoreExpense[] = [];

  // Generate some random expenses for the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const randomDays = [5, 10, 15, 20, 25]; // Some random days to have expenses

  for (const day of randomDays) {
    if (day > daysInMonth) continue;

    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];

    // Ensure dateStr is valid
    if (dateStr) {
      result.push({
        id: `expense-${dateStr}`,
        amount: Math.round(Math.random() * 1000) / 10, // Random amount between 0 and 100
        description: `Store expense for ${dateStr}`,
        date: dateStr, // Already a valid string
        isPaid: Math.random() > 0.5, // Randomly paid or unpaid
      });
    }
  }

  return result;
}