"use client";
import { formatCurrency } from "@/lib/utils";
import type { Sale } from "@/server/db/schema/sales-schema";
import { use, useEffect, useMemo, useState } from "react";

import { SalesListItem } from "./sales-list-item";

import { ptBR } from "date-fns/locale";
import { format, isValid, parse, parseISO } from "date-fns";
import { Dot } from "lucide-react";
import EditSale from "@/app/_components/dialogs/edit/edit-sale";

function groupSalesByDate(sales: Sale[]) {
  return sales
    .sort((a, b) => {
      const aDate =
        typeof a.dateTime === "string"
          ? parseISO(a.dateTime)
          : new Date(a.dateTime);
      const bDate =
        typeof b.dateTime === "string"
          ? parseISO(b.dateTime)
          : new Date(b.dateTime);
      const dateA = isValid(aDate) ? format(aDate, "yyyy-MM-dd") : "";
      const dateB = isValid(bDate) ? format(bDate, "yyyy-MM-dd") : "";
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return a.id - b.id;
    })
    .reduce<Record<string, Sale[]>>((acc, sale) => {
      const saleDate =
        typeof sale.dateTime === "string"
          ? parseISO(sale.dateTime)
          : new Date(sale.dateTime);
      if (!isValid(saleDate)) return acc;
      const date = format(saleDate, "yyyy-MM-dd");
      acc[date] ??= [];
      acc[date].push(sale);
      return acc;
    }, {});
}

function sumSalesByDate(sales: Sale[]): number {
  return sales.reduce((sum, sale) => sum + Number(sale.value), 0);
}

export default function SalesList({
  sales,
  labels,
  totalProfit,
  aggregates,
}: {
  sales: Promise<Sale[]>;
  labels?: { plural?: string };
  totalProfit?: Promise<number>;
  aggregates?: Promise<{ totalRevenue: number; productProfit: number }>;
}) {
  const allSales = use(sales);
  const aggregateData = aggregates ? use(aggregates) : undefined;

  const totalRevenueMemo = useMemo(
    () => allSales.reduce((sum, s) => sum + Number(s.value), 0),
    [allSales],
  );
  const totalRevenue = aggregateData?.totalRevenue ?? totalRevenueMemo;

  const [profitState, setProfitState] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function compute() {
      if (totalProfit) {
        try {
          const value = await totalProfit;
          if (!cancelled) setProfitState(value);
        } catch {
          if (!cancelled) setProfitState(0);
        }
        return;
      }
      // Fallback: client compute if no aggregate provided
      try {
        const profits = await Promise.all(
          allSales.map(async (s) => {
            const res = await fetch(`/api/vendas/${s.id}/itens`, {
              cache: "no-store",
            });
            if (!res.ok) return 0;
            const data = (await res.json()) as Array<{
              quantity: number;
              unitPrice: string;
              cost?: string;
            }>;
            return data.reduce((acc, it) => {
              const unit = Number(it.unitPrice) || 0;
              const cost = Number(it.cost) || 0;
              const qty = Number(it.quantity) || 0;
              return acc + (unit - cost) * qty;
            }, 0);
          }),
        );
        const sum = profits.reduce((a, b) => a + b, 0);
        if (!cancelled) setProfitState(sum);
      } catch {
        if (!cancelled) setProfitState(0);
      }
    }
    void compute();
    return () => {
      cancelled = true;
    };
  }, [allSales, totalProfit]);

  if (allSales.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Nenhum resultado encontrado para o mês selecionado
      </div>
    );
  }

  const profitAmount = profitState ?? 0;
  const totals = {
    total: totalRevenue,
    profitAmount,
    baseValue: totalRevenue - profitAmount,
  } as const;

  const grouped = groupSalesByDate(allSales);
  const sortedDates = Object.keys(grouped).sort();

  const labelPlural = labels?.plural ?? "receitas";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2 px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="sm:border-r sm:pr-2">
            <p>Total do mês</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.total)}
            </p>
          </div>
          <div className="flex divide-x">
            <div className="pr-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <p className="text-sm">Base</p>
              </div>
              <p className="text-lg font-bold">
                {formatCurrency(totals.baseValue)}
              </p>
            </div>
            <div className="pl-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <p className="text-sm">Lucro</p>
              </div>
              <p className="text-lg font-bold">
                {formatCurrency(totals.profitAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {sortedDates.length === 0 && (
        <div className="text-muted-foreground px-5 py-8 text-center">
          {`Nenhuma ${labelPlural.slice(0, -1)} encontrada.`}
        </div>
      )}

      <div className="divide-y">
        {sortedDates.map((date) => (
          <div key={date} className="pb-4">
            <div className="text-muted-foreground bg-muted flex items-center p-1 px-4 text-sm">
              <p className="text-primary font-semibold uppercase">
                {format(
                  parse(date, "yyyy-MM-dd", new Date()),
                  "dd 'de' MMMM, EEE",
                  { locale: ptBR },
                )}
              </p>
              <Dot />
              <p>{formatCurrency(sumSalesByDate(grouped[date] ?? []))}</p>
            </div>
            <div className="flex flex-col divide-y">
              {grouped[date]?.map((sale) => (
                <EditSale data={sale} key={sale.id}>
                  <div className="cursor-pointer">
                    <SalesListItem sale={sale} />
                  </div>
                </EditSale>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
