"use client";

import { cn, formatCurrency } from "@/lib/utils";
import type { CashRegister } from "@/server/db/schema/cash-register-schema";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as React from "react";

export interface CashRegisterListItemProps {
  cashRegister: CashRegister;
  children?: React.ReactNode;
}

export function CashRegisterListItem({
  cashRegister,
  children,
}: CashRegisterListItemProps) {
  return (
    <div
      className={cn(
        "hover:bg-background-secondary active:bg-accent flex cursor-pointer items-center gap-2 py-2 sm:px-2",
      )}
    >
      <div className="flex w-full items-center gap-2">
        <p>
          {format(parseISO(cashRegister.date), "dd/MM", {
            locale: ptBR,
          }).toUpperCase()}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <p className={cn("w-fit text-right whitespace-nowrap")}>
          {formatCurrency(cashRegister.value)}
        </p>
      </div>
      {children}
    </div>
  );
}
