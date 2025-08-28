"use client";

import { cn, formatCurrency } from "@/lib/utils";
import type { Income as Sale } from "@/server/db/schema/incomes-schema";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as React from "react";

export interface SaleListItemProps {
  sale: Sale;
  children?: React.ReactNode;
}

export function SalesListItem({ sale, children }: SaleListItemProps) {
  const totalIncome = Number(sale.value); // total sale value
  const profitMarginPercent = Number(sale.profitMargin);
  const profitAmount = totalIncome * (profitMarginPercent / 100);

  return (
    <div
      className={cn(
        "hover:bg-background-secondary active:bg-accent flex cursor-pointer items-center gap-2 py-2 sm:px-2",
      )}
    >
      <div className="w-full">
        <p className="text-base">{sale.description}</p>
        <p className="text-muted-foreground text-sm whitespace-nowrap">
          {format(parseISO(sale.dateTime.toISOString()), "HH:mm", {
            locale: ptBR,
          }).toUpperCase()}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <p className={cn("w-fit text-right font-semibold")}>
          {formatCurrency(totalIncome)}
        </p>
        <p className="text-muted-foreground text-sm whitespace-nowrap">
          Lucro: {profitMarginPercent}% ({formatCurrency(profitAmount)})
        </p>
      </div>
      {children}
    </div>
  );
}
