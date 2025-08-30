"use client";

import { cn, formatCurrency } from "@/lib/utils";
import type { Sale } from "@/server/db/schema/sales-schema";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as React from "react";

export interface SaleListItemProps {
  sale: Sale;
  children?: React.ReactNode;
}

export function SalesListItem({ sale, children }: SaleListItemProps) {
  const totalSale = Number(sale.value);
  const [profitAmount, setProfitAmount] = React.useState<number>(0);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/vendas/${sale.id}/itens`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Array<{
          productId: number;
          quantity: number;
          unitPrice: string;
          cost?: string;
        }>;
        const profit = data.reduce((acc, it) => {
          const unit = Number(it.unitPrice) || 0;
          const cost = Number(it.cost) || 0;
          const qty = Number(it.quantity) || 0;
          return acc + (unit - cost) * qty;
        }, 0);
        if (!cancelled) setProfitAmount(profit);
      } catch {}
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [sale.id]);

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
          {formatCurrency(totalSale)}
        </p>
        <p className="text-muted-foreground text-sm whitespace-nowrap">Lucro: {formatCurrency(profitAmount)}</p>
      </div>
      {children}
    </div>
  );
}
