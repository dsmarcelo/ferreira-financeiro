"use client";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditCashRegister from "../dialogs/edit/edit-cash-register";
import { cn, formatCurrency } from "@/lib/utils";
import type { CashRegister } from "@/server/db/schema/cash-register";
import { use } from "react";
import DownloadButton from "../buttons/download-button";
import ShareButton from "../buttons/share-button";

// Helper to group cash registers by date string (YYYY-MM-DD)
function groupByDate(cashRegisters: CashRegister[]) {
  return cashRegisters
    .sort((a, b) =>
      a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date)
    )
    .reduce<Record<string, CashRegister[]>>((acc, cashRegister) => {
      const date = cashRegister.date;
      acc[date] ??= [];
      acc[date].push(cashRegister);
      return acc;
    }, {});
}

export default function CashRegisterList({
  cashRegisters,
}: {
  cashRegisters: Promise<CashRegister[]>;
}) {
  const allCashRegisters = use(cashRegisters);
  const grouped = groupByDate(allCashRegisters);
  const sortedDates = Object.keys(grouped).sort();

  const total = allCashRegisters.reduce(
    (acc, item) => acc + Number(item.value),
    0
  );

  if (allCashRegisters.length === 0) {
    return <p>Nenhum resultado encontrado para o mês selecionado</p>;
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="sm:border-r sm:pr-2">
            <p>Total do mês</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <DownloadButton />
          <ShareButton />
        </div>
      </div>
      <div className="mx-auto w-full divide-y">
        {sortedDates.map((date) => (
          <div key={date} className="py-2">
            <div className="flex flex-col">
              <div className="text-muted-foreground font-base flex w-fit items-center justify-between gap-2 text-xs whitespace-nowrap">
                <p>
                  {format(parseISO(date), "dd MMM", {
                    locale: ptBR,
                  }).toUpperCase()}
                </p>
                <p>
                  (
                  {formatCurrency(
                    grouped[date]?.reduce(
                      (acc, item) => acc + Number(item.value),
                      0
                    ) ?? 0
                  )}
                  )
                </p>
              </div>
              <div className="flex w-full flex-col justify-between divide-y divide-gray-100">
                {grouped[date]?.map((item) => (
                  <EditCashRegister data={item} key={item.id}>
                    <div
                      className={cn(
                        "hover:bg-background-secondary active:bg-accent flex cursor-pointer items-center gap-2 py-2"
                      )}
                    >
                      <div className="flex w-full items-center gap-2">
                        <span className="flex-1 break-words" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-fit text-right whitespace-nowrap">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    </div>
                  </EditCashRegister>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
