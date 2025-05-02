"use client";

import * as React from "react";
import { format, isValid, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

// Helper function to parse YYYY-MM to Date
const parseYYYYMM = (dateStr: string | null): Date => {
  if (!dateStr) return new Date();
  const [year, month] = dateStr.split("-").map(Number);
  if (!year || !month || isNaN(year) || isNaN(month)) return new Date();
  const date = new Date(year, month - 1);
  return isValid(date) ? date : new Date();
};

// Key for storing the selected month in localStorage
const LOCAL_STORAGE_KEY = "selectedMonth";

export default function DateRangePicker({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the initial month: prefer searchParams, fallback to localStorage, then today
  const getInitialMonth = React.useCallback((): Date => {
    const fromParam = searchParams.get("from");
    if (fromParam) {
      // Save to localStorage for persistence
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, fromParam);
      } catch {}
      return parseYYYYMM(fromParam);
    }
    // Fallback to localStorage if no search param
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) return parseYYYYMM(stored);
    } catch {}
    // Default to today
    return new Date();
  }, [searchParams]);

  // State for the current date (month)
  const [currentDate, setCurrentDate] = React.useState<Date>(() =>
    getInitialMonth(),
  );

  // Sync state with searchParams/localStorage on mount or when searchParams change
  React.useEffect(() => {
    setCurrentDate(getInitialMonth());
  }, [getInitialMonth]);

  // Add new effect to default to current month only if no localStorage and no 'from' param
  React.useEffect(() => {
    const fromParam = searchParams.get("from");
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!fromParam || !stored) {
      updateDate(currentDate);
    }
  }, []);

  // Function to update URL and localStorage with new date range (first and last day of month)
  const updateDate = (newDate: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    // Get first and last day of the selected month
    const from = format(startOfMonth(newDate), "yyyy-MM-dd");
    const to = format(endOfMonth(newDate), "yyyy-MM-dd");
    params.set("from", from);
    params.set("to", to);
    // Update localStorage for persistence
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, from);
    } catch {}
    console.log(params.toString());
    router.replace(`?${params.toString()}`);
  };

  // Navigate to previous/next month
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate); // Update local state immediately for UI responsiveness
    updateDate(newDate);
  };

  return (
    <div
      className={`flex h-12 items-center justify-between gap-2 ${className}`}
    >
      <Button
        variant="ghost"
        size="lg"
        className="active:bg-accent w-full flex-1 hover:bg-transparent"
        onClick={() => navigateMonth("prev")}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <p className="min-w-32 text-center font-medium">
        {format(currentDate, "MMMM yyyy", { locale: ptBR })
          .charAt(0)
          .toUpperCase() +
          format(currentDate, "MMMM yyyy", { locale: ptBR }).slice(1)}
      </p>
      <Button
        variant="ghost"
        size="lg"
        className="active:bg-accent w-full flex-1 hover:bg-transparent"
        onClick={() => navigateMonth("next")}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
