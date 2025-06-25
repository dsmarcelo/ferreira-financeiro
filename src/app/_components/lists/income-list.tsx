"use client";
import EditIncome from "@/app/_components/dialogs/edit/edit-income";
import { formatCurrency } from "@/lib/utils";
import type { Income } from "@/server/db/schema/incomes-schema";
import { use } from "react";
import { useCallback, useTransition } from "react";
import { IncomeListItem } from "./income-list-item";
import DownloadButton from "@/app/_components/buttons/download-button";
import ShareButton from "@/app/_components/buttons/share-button";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { Dot } from "lucide-react";

function groupByDate(incomes: Income[]) {
  return incomes
    .sort((a, b) => {
      const dateA = format(a.dateTime, "yyyy-MM-dd");
      const dateB = format(b.dateTime, "yyyy-MM-dd");
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return a.id - b.id;
    })
    .reduce<Record<string, Income[]>>((acc, income) => {
      const date = format(income.dateTime, "yyyy-MM-dd");
      acc[date] ??= [];
      acc[date].push(income);
      return acc;
    }, {});
}

function sumIncomesByDate(incomes: Income[]): number {
  return incomes.reduce((sum, income) => sum + Number(income.value), 0);
}

export default function IncomeList({
  incomes,
}: {
  incomes: Promise<Income[]>;
}) {
  const allIncomes = use(incomes);

  // PDF actions (hooks must be above any return)
  const [isPending, startTransition] = useTransition();
  const handleDownload = useCallback(() => {
    startTransition(() => {
      // TODO: Implement income PDF download functionality
      console.log("Download income PDF", allIncomes);
    });
  }, [allIncomes]);
  const handleShare = useCallback(() => {
    startTransition(() => {
      // TODO: Implement income PDF share functionality
      console.log("Share income PDF", allIncomes);
    });
  }, [allIncomes]);

  if (allIncomes.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Nenhum resultado encontrado para o mês selecionado
      </div>
    );
  }

  const totals = allIncomes.reduce(
    (acc, item) => {
      const totalIncome = Number(item.value); // This is the total income input by user
      const profitMarginPercent = Number(item.profitMargin);
      const profitAmount = totalIncome * (profitMarginPercent / 100);
      const baseValue = totalIncome - profitAmount;
      return {
        baseValue: acc.baseValue + baseValue,
        profitAmount: acc.profitAmount + profitAmount,
        total: acc.total + totalIncome,
      };
    },
    { baseValue: 0, profitAmount: 0, total: 0 },
  );

  const grouped = groupByDate(allIncomes);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="sm:border-r sm:pr-2">
            <p>Total do mês</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.total)}</p>
          </div>
          <div className="flex divide-x">
            <div className="pr-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <p className="text-sm">Base</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totals.baseValue)}</p>
            </div>
            <div className="pl-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <p className="text-sm">Lucro</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totals.profitAmount)}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <DownloadButton
            aria-label="Baixar PDF das receitas"
            onClick={handleDownload}
            disabled={isPending}
          />
          <ShareButton
            aria-label="Compartilhar PDF das receitas"
            onClick={handleShare}
            disabled={isPending}
          />
        </div>
      </div>

      {sortedDates.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          Nenhuma receita encontrada.
        </div>
      )}

      <div className="space-y-4">
        {sortedDates.map((date) => (
          <div key={date}>
            <div className="text-muted-foreground flex items-center text-xs">
              <p className="font-semibold uppercase text-primary">
              {format(parseISO(date), "dd 'de' MMMM, EEE", { locale: ptBR })}
              </p>
              <Dot />
              <p>{formatCurrency(sumIncomesByDate(grouped[date] ?? []))}</p>
            </div>
            <div className="flex flex-col gap-2">
              {grouped[date]?.map((income) => (
                <EditIncome data={income} key={income.id}>
              <div>
                    <IncomeListItem income={income} />
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