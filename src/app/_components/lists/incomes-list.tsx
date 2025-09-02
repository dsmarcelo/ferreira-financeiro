"use client";

import { formatCurrency } from "@/lib/utils";
import type { Income } from "@/server/db/schema/incomes-schema";
import { use, useMemo } from "react";
import { format, isValid, parse, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dot } from "lucide-react";
import { IncomesListItem } from "./incomes-list-item";

import EditIncome from "@/app/_components/dialogs/edit/edit-income";

function groupIncomesByDate(incomes: Income[]) {
  return incomes
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
    .reduce<Record<string, Income[]>>((acc, income) => {
      const dt =
        typeof income.dateTime === "string"
          ? parseISO(income.dateTime)
          : new Date(income.dateTime);
      if (!isValid(dt)) return acc;
      const date = format(dt, "yyyy-MM-dd");
      acc[date] ??= [];
      acc[date].push(income);
      return acc;
    }, {});
}

function sumIncomesByDate(incomes: Income[]): number {
  return incomes.reduce((sum, income) => sum + Number(income.value), 0);
}

export default function IncomesList({
  incomes,
  labels,
}: {
  incomes: Promise<Income[]>;
  labels?: { plural?: string };
}) {
  const allIncomes = use(incomes);

  const totalRevenue = useMemo(
    () => allIncomes.reduce((sum, s) => sum + Number(s.value), 0),
    [allIncomes],
  );

  const profitAmount = useMemo(
    () =>
      allIncomes.reduce(
        (sum, s) => sum + Number(s.value) * (Number(s.profitMargin) / 100),
        0,
      ),
    [allIncomes],
  );

  if (allIncomes.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Nenhum resultado encontrado para o mês selecionado
      </div>
    );
  }

  const totals = {
    total: totalRevenue,
    profitAmount,
    baseValue: totalRevenue - profitAmount,
  } as const;

  const grouped = groupIncomesByDate(allIncomes);
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
              <p>{formatCurrency(sumIncomesByDate(grouped[date] ?? []))}</p>
            </div>
            <div className="flex flex-col divide-y px-5">
              {grouped[date]?.map((income) => (
                <EditIncome data={income} key={income.id}>
                  <div className="cursor-pointer">
                    <IncomesListItem income={income} />
                  </div>
                </EditIncome>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
