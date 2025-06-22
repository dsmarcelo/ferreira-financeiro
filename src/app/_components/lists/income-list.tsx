"use client";
import EditIncome from "@/app/_components/dialogs/edit/edit-income";
import { formatCurrency, getSelectedMonth } from "@/lib/utils";
import type { Income } from "@/server/db/schema/incomes-schema";
import { use } from "react";
import { useCallback, useTransition } from "react";
import { IncomeListItem } from "./income-list-item";
import DownloadButton from "@/app/_components/buttons/download-button";
import ShareButton from "@/app/_components/buttons/share-button";

export default function IncomeList({
  incomes,
}: {
  incomes: Promise<Income[]>;
}) {
  const allIncomes = use(incomes);
  const selectedMonth = getSelectedMonth();

  // PDF actions (hooks must be above any return)
  const [isPending, startTransition] = useTransition();
  const handleDownload = useCallback(() => {
    startTransition(() => {
      // TODO: Implement income PDF download functionality
      console.log("Download income PDF", allIncomes, selectedMonth);
    });
  }, [allIncomes, selectedMonth]);
  const handleShare = useCallback(() => {
    startTransition(() => {
      // TODO: Implement income PDF share functionality
      console.log("Share income PDF", allIncomes, selectedMonth);
    });
  }, [allIncomes, selectedMonth]);

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

  if (allIncomes.length === 0) {
    return <p>Nenhum resultado encontrado para o mês selecionado</p>;
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div>
            <p>Total do mês</p>
            <p className="text-xl font-bold">Base: {formatCurrency(totals.baseValue)}</p>
            <p className="text-xl font-bold">Lucro: {formatCurrency(totals.profitAmount)}</p>
            <p className="text-2xl font-bold text-green-600">Total: {formatCurrency(totals.total)}</p>
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
      <div className="mx-auto w-full divide-y">
        <div className="flex w-full flex-col justify-between divide-y">
          {allIncomes.map((item) => (
            <EditIncome data={item} key={item.id}>
              <div>
                <IncomeListItem income={item} />
              </div>
            </EditIncome>
          ))}
        </div>
      </div>
    </>
  );
}