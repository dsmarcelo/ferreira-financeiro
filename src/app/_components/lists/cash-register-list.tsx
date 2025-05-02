"use client";
import EditCashRegister from "../dialogs/edit/edit-cash-register";
import { formatCurrency } from "@/lib/utils";
import type { CashRegister } from "@/server/db/schema/cash-register";
import { use } from "react";
import DownloadButton from "../buttons/download-button";
import ShareButton from "../buttons/share-button";
import { CashRegisterListItem } from "./cash-entry-list-item";

export default function CashRegisterList({
  cashRegisters,
}: {
  cashRegisters: Promise<CashRegister[]>;
}) {
  const allCashRegisters = use(cashRegisters);

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
          <DownloadButton />
          <ShareButton />
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
