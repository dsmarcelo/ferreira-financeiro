"use client";

import { formatCurrency } from "@/lib/utils";
import type { Income as Sale } from "@/server/db/schema/incomes-schema";
import { use, useEffect, useMemo, useState } from "react";
import { format, isValid, parse, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function toDateKey(d: unknown): string {
  const dt = typeof d === "string" ? parseISO(d) : new Date(d as Date);
  if (!isValid(dt)) return "";
  return format(dt, "yyyy-MM-dd");
}

export default function DailyIncomeList({
  sales,
}: {
  // Sales are backed by incomes; already filtered to the selected month
  sales: Promise<Sale[]>;
}) {
  const allSales = use(sales);

  // Map saleId -> profit for that sale
  const [profitBySale, setProfitBySale] = useState<Record<number, number>>({});

  useEffect(() => {
    let cancelled = false;
    async function loadProfits() {
      try {
        const results = await Promise.all(
          allSales.map(async (s) => {
            try {
              const res = await fetch(`/api/vendas/${s.id}/itens`, {
                cache: "no-store",
              });
              if (!res.ok) return [s.id, 0] as const;
              const data = (await res.json()) as Array<{
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
              return [s.id, profit] as const;
            } catch {
              return [s.id, 0] as const;
            }
          }),
        );
        if (cancelled) return;
        const map: Record<number, number> = {};
        for (const [id, profit] of results) map[id] = profit;
        setProfitBySale(map);
      } catch {
        if (!cancelled) setProfitBySale({});
      }
    }
    void loadProfits();
    return () => {
      cancelled = true;
    };
  }, [allSales]);

  const grouped = useMemo(() => {
    return allSales.reduce<Record<string, Sale[]>>((acc, s) => {
      const key = toDateKey(s.dateTime);
      acc[key] ??= [];
      acc[key].push(s);
      return acc;
    }, {});
  }, [allSales]);

  const sortedDates = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  if (allSales.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Nenhum resultado encontrado para o mês selecionado
      </div>
    );
  }

  return (
    <div className="divide-y">
      {sortedDates.map((dateKey) => {
        const dateObj = parse(dateKey, "yyyy-MM-dd", new Date());
        const daySales = grouped[dateKey] ?? [];
        const dayTotal = daySales.reduce((sum, s) => sum + Number(s.value), 0);
        const dayProfit = daySales.reduce(
          (sum, s) => sum + (profitBySale[s.id] ?? 0),
          0,
        );
        const count = daySales.length;

        return (
          <div
            key={dateKey}
            className="flex items-center justify-between px-5 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">
                {format(dateObj, "dd 'de' MMMM, EEE", { locale: ptBR })}
              </p>
              <p className="text-muted-foreground text-sm">
                {count} {count === 1 ? "venda" : "vendas"}
              </p>
            </div>
            <div className="ml-4 text-right">
              <p className="font-semibold">{formatCurrency(dayTotal)}</p>
              <p className="text-muted-foreground text-sm">
                Lucro: {formatCurrency(dayProfit)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
