"use client";

import { cn, formatCurrency } from "@/lib/utils";
import type { Income } from "@/server/db/schema/incomes-schema";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as React from "react";

export interface IncomeListItemProps {
  income: Income;
  children?: React.ReactNode;
}

export function IncomesListItem({ income, children }: IncomeListItemProps) {
  const totalIncome = Number(income.value);
  const profitAmount = totalIncome * (Number(income.profitMargin) / 100);

  return (
    <div
      className={cn(
        "hover:bg-background-secondary active:bg-accent flex cursor-pointer items-center gap-2 py-2 sm:px-2",
      )}
    >
      <div className="w-full">
        <p className="text-base">{income.description}</p>
        <p className="text-muted-foreground text-sm whitespace-nowrap">
          {format(parseISO(income.dateTime.toISOString()), "HH:mm", {
            locale: ptBR,
          }).toUpperCase()}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <p className={cn("w-fit text-right font-semibold")}>
          {formatCurrency(totalIncome)}
        </p>
        <p className="text-muted-foreground text-sm whitespace-nowrap">Lucro: {formatCurrency(profitAmount)}</p>
      </div>
      {children}
    </div>
  );
}


