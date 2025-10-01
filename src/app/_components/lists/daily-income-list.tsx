"use client";

import { formatCurrency } from "@/lib/utils";
import type { Income } from "@/server/db/schema/incomes-schema";
import { use, useMemo } from "react";
import { format, isValid, parse, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function toDateKey(d: unknown): string {
  const dt = typeof d === "string" ? parseISO(d) : new Date(d as Date);
  if (!isValid(dt)) return "";
  return format(dt, "yyyy-MM-dd");
}

export default function DailyIncomeList({
  incomes,
}: {
  incomes: Promise<Income[]>;
}) {
  const allIncomes = use(incomes);

  const groupedIncomes = useMemo(() => {
    return allIncomes.reduce<Record<string, Income[]>>((acc, inc) => {
      const key = toDateKey(inc.dateTime);
      if (!key) return acc;
      acc[key] ??= [];
      acc[key].push(inc);
      return acc;
    }, {});
  }, [allIncomes]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedIncomes).sort((a, b) => b.localeCompare(a));
  }, [groupedIncomes]);

  if (allIncomes.length === 0) {
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
        const dayIncomes = groupedIncomes[dateKey] ?? [];
        const dayIncomesTotal = dayIncomes.reduce(
          (sum, income) => sum + Number(income.value),
          0,
        );
        const count = dayIncomes.length;

        return (
          <div
            key={dateKey}
            className="flex items-center justify-between px-5 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">
                {format(dateObj, "dd/MM, EEE", { locale: ptBR })}
              </p>
              <p className="text-muted-foreground text-sm">
                {count} {count === 1 ? "receita" : "receitas"}
              </p>
            </div>
            <div className="ml-4 text-right">
              <p className="font-semibold">{formatCurrency(dayIncomesTotal)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
