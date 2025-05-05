"use client";
import EditCashRegister from "@/app/_components/dialogs/edit/edit-cash-register";
import { formatCurrency, getSelectedMonth } from "@/lib/utils";
import type { CashRegister } from "@/server/db/schema/cash-register";
import { use } from "react";
import { useCallback, useTransition } from "react";
import {
  downloadCashRegisterPDF,
  shareCashRegisterPDF,
} from "@/lib/pdf/cash-register-pdf";
import { CashRegisterListItem } from "@/app/_components/lists/cash-entry-list-item";
import DownloadButton from "@/app/_components/buttons/download-button";
import ShareButton from "@/app/_components/buttons/share-button";

export default function CashRegisterList({
  cashRegisters,
}: {
  cashRegisters: Promise<CashRegister[]>;
}) {
  const allCashRegisters = use(cashRegisters);
  const selectedMonth = getSelectedMonth();

  // PDF actions (hooks must be above any return)
  const [isPending, startTransition] = useTransition();
  const handleDownload = useCallback(() => {
    startTransition(() => {
      downloadCashRegisterPDF(allCashRegisters, `Caixa - ${selectedMonth}`);
    });
  }, [allCashRegisters, selectedMonth]);
  const handleShare = useCallback(() => {
    startTransition(() => {
      void shareCashRegisterPDF(allCashRegisters, `Caixa - ${selectedMonth}`);
    });
  }, [allCashRegisters, selectedMonth]);

  const total = allCashRegisters.reduce(
    (acc, item) => acc + Number(item.value),
    0,
  );

  if (allCashRegisters.length === 0) {
    return <p>Nenhum resultado encontrado para o mês selecionado</p>;
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div>
            <p>Total do mês</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <DownloadButton
            aria-label="Baixar PDF do caixa"
            onClick={handleDownload}
            disabled={isPending}
          />
          <ShareButton
            aria-label="Compartilhar PDF do caixa"
            onClick={handleShare}
            disabled={isPending}
          />
        </div>
      </div>
      <div className="mx-auto w-full divide-y">
        <div className="flex w-full flex-col justify-between divide-y">
          {allCashRegisters.map((item) => (
            <EditCashRegister data={item} key={item.id}>
              <div>
                <CashRegisterListItem cashRegister={item} />
              </div>
            </EditCashRegister>
          ))}
        </div>
      </div>
    </>
  );
}
