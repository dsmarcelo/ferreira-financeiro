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

export function MonthPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current date from search params or use current date
  const currentDate = React.useMemo(() => {
    const fromParam = searchParams.get("from");
    return parseYYYYMM(fromParam);
  }, [searchParams]);

  // Function to update URL with new date range (first and last day of month)
  const updateDate = (newDate: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    // Get first and last day of the selected month
    const from = format(startOfMonth(newDate), "yyyy-MM-dd");
    const to = format(endOfMonth(newDate), "yyyy-MM-dd");
    params.set("from", from);
    params.set("to", to);
    router.push(`?${params.toString()}`);
  };

  // Navigate to previous/next month
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    updateDate(newDate);
  };

  return (
    <div className="bg-primary-foreground flex h-14 items-center justify-between gap-2 px-5">
      <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")}>
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <div className="min-w-[200px] text-center font-medium">
        {format(currentDate, "MMMM yyyy", { locale: ptBR })
          .charAt(0)
          .toUpperCase() +
          format(currentDate, "MMMM yyyy", { locale: ptBR }).slice(1)}
      </div>
      <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")}>
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
