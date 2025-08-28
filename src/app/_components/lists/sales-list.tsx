"use client";
import { formatCurrency } from "@/lib/utils";
import type { Income } from "@/server/db/schema/incomes-schema";
import { use } from "react";
import { useCallback, useTransition } from "react";
import { SalesListItem } from "./sales-list-item";
import DownloadButton from "@/app/_components/buttons/download-button";
import ShareButton from "@/app/_components/buttons/share-button";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { Dot } from "lucide-react";
import EditSale from "@/app/_components/dialogs/edit/edit-sale";

function groupSalesByDate(sales: Income[]) {
  return sales
    .sort((a, b) => {
      const dateA = format(a.dateTime, "yyyy-MM-dd");
      const dateB = format(b.dateTime, "yyyy-MM-dd");
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return a.id - b.id;
    })
    .reduce<Record<string, Income[]>>((acc, sale) => {
      const date = format(sale.dateTime, "yyyy-MM-dd");
      acc[date] ??= [];
      acc[date].push(sale);
      return acc;
    }, {});
}

function sumSalesByDate(sales: Income[]): number {
  return sales.reduce((sum, sale) => sum + Number(sale.value), 0);
}

export default function SalesList({
  sales,
  labels,
}: {
  sales: Promise<Income[]>;
  labels?: { plural?: string };
}) {
  const allSales = use(sales);

  // PDF actions (hooks must be above any return)
  const [isPending, startTransition] = useTransition();
  const handleDownload = useCallback(() => {
    startTransition(() => {
      // TODO: Implement sales PDF download functionality
      console.log("Download sales PDF", allSales);
    });
  }, [allSales]);
  const handleShare = useCallback(() => {
    startTransition(() => {
      // TODO: Implement sales PDF share functionality
      console.log("Share sales PDF", allSales);
    });
  }, [allSales]);

  if (allSales.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Nenhum resultado encontrado para o mês selecionado
      </div>
    );
  }

  const totals = allSales.reduce(
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
        <div className="flex gap-2">
          <DownloadButton
            aria-label={`Baixar PDF das ${labelPlural}`}
            onClick={handleDownload}
            disabled={isPending}
          />
          <ShareButton
            aria-label={`Compartilhar PDF das ${labelPlural}`}
            onClick={handleShare}
            disabled={isPending}
          />
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
                {format(parseISO(date), "dd 'de' MMMM, EEE", { locale: ptBR })}
              </p>
              <Dot />
              <p>{formatCurrency(sumSalesByDate(grouped[date] ?? []))}</p>
            </div>
            <div className="flex flex-col divide-y px-5">
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
