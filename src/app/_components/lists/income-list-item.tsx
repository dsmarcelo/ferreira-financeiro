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

export function IncomeListItem({ income, children }: IncomeListItemProps) {
  const totalIncome = Number(income.value); // This is the total income input by user
  const profitMarginPercent = Number(income.profitMargin);
  const profitAmount = totalIncome * (profitMarginPercent / 100);
  const baseValue = totalIncome - profitAmount;

  return (
    <div
      className={cn(
        "hover:bg-background-secondary active:bg-accent flex cursor-pointer items-center gap-2 py-2 sm:px-2",
      )}
    >
      <div className="flex w-full items-center gap-2">
        <p>
          {format(parseISO(income.dateTime.toISOString()), "dd/MM", {
            locale: ptBR,
          }).toUpperCase()}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className="text-muted-foreground text-sm">
          Base: {formatCurrency(baseValue)}
        </p>
        <p className="text-muted-foreground text-sm">
          Lucro: {profitMarginPercent}% ({formatCurrency(profitAmount)})
        </p>
        <p className={cn("w-fit text-right font-semibold whitespace-nowrap")}>
          Total: {formatCurrency(totalIncome)}
        </p>
      </div>
      {children}
    </div>
  );
}
