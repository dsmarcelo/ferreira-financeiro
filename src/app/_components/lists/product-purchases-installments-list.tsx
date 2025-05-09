"use client";

import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { useState, startTransition, useOptimistic, use } from "react";
import { formatCurrency } from "@/lib/utils";
import type { ProductPurchaseInstallment } from "@/server/db/schema/product-purchase";
import {
  actionUpdateProductPurchaseInstallment,
  actionDeleteProductPurchaseInstallment,
} from "@/actions/product-purchase-actions";
import DownloadButton from "../buttons/download-button";
import ShareButton from "../buttons/share-button";
// You may want to implement PDF helpers for installments, similar to purchases
// import { downloadInstallmentsPDF, shareInstallmentsPDF } from "@/lib/pdf/installments-pdf";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductPurchasesInstallmentsListProps {
  productPurchaseInstallments: Promise<ProductPurchaseInstallment[]>;
}

function groupInstallmentsByDate(installments: ProductPurchaseInstallment[]) {
  return installments
    .slice()
    .sort((a, b) =>
      a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : a.id - b.id,
    )
    .reduce<Record<string, ProductPurchaseInstallment[]>>((acc, inst) => {
      const date =
        typeof inst.dueDate === "string"
          ? inst.dueDate.slice(0, 10)
          : inst.dueDate instanceof Date
            ? inst.dueDate.toISOString().slice(0, 10)
            : "";
      acc[date] ??= [];
      acc[date].push(inst);
      return acc;
    }, {});
}

export default function ProductPurchasesInstallmentsList({
  productPurchaseInstallments,
}: ProductPurchasesInstallmentsListProps) {
  const allInstallments = use(productPurchaseInstallments);
  const [selectedInstallment, setSelectedInstallment] =
    useState<ProductPurchaseInstallment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Optimistic UI for paid toggle
  const [optimisticInstallments, setOptimisticInstallments] = useOptimistic(
    allInstallments,
    (
      state: ProductPurchaseInstallment[],
      update: { id: number; checked: boolean },
    ) =>
      state.map((item) =>
        item.id === update.id ? { ...item, isPaid: update.checked } : item,
      ),
  );

  if (allInstallments.length === 0) {
    return <p>Nenhuma parcela encontrada para o período selecionado</p>;
  }

  const grouped = groupInstallmentsByDate(optimisticInstallments);
  const sortedDates = Object.keys(grouped).sort();

  const total = allInstallments.reduce(
    (acc, item) => acc + Number(item.amount),
    0,
  );
  const totalPaid = allInstallments
    .filter((item) => item.isPaid)
    .reduce((acc, item) => acc + Number(item.amount), 0);
  const totalUnpaid = total - totalPaid;

  // Placeholder for export/share helpers
  const handleDownload = () => {
    toast.info("Exportação de PDF de parcelas ainda não implementada.");
  };
  const handleShare = () => {
    toast.info("Compartilhamento de PDF de parcelas ainda não implementado.");
  };

  if (allInstallments.length === 0) {
    return <p>Nenhuma parcela encontrada para o período selecionado</p>;
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="sm:border-r sm:pr-2">
            <p>Total de parcelas</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          </div>
          <div className="flex divide-x">
            <div className="pr-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <p className="text-sm">Total pago</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="pl-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <p className="text-sm">Total pendente</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totalUnpaid)}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <DownloadButton onClick={handleDownload} />
          <ShareButton onClick={handleShare} />
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
                      (acc, item) => acc + Number(item.amount),
                      0,
                    ) ?? 0,
                  )}
                  )
                </p>
              </div>
              <div className="flex w-full flex-col justify-between divide-y divide-gray-100">
                {grouped[date]?.map((item) => (
                  <div key={item.id}>
                    <div className="hover:bg-background-secondary active:bg-accent flex w-full items-center gap-2 py-2 sm:px-2">
                      <Checkbox
                        className="h-6 w-6 active:bg-slate-500"
                        checked={item.isPaid}
                        aria-label={
                          item.isPaid
                            ? "Desmarcar como pago"
                            : "Marcar como pago"
                        }
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={(checked) => {
                          startTransition(() => {
                            setOptimisticInstallments({
                              id: item.id,
                              checked: checked as boolean,
                            });
                          });
                          void actionUpdateProductPurchaseInstallment(item.id, {
                            isPaid: checked as boolean,
                          });
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                          <span className="text-xs font-medium">
                            Parcela {item.installmentNumber}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            Venc: {format(parseISO(item.dueDate), "dd/MM/yyyy")}
                          </span>
                        </div>
                        <p className="font-medium break-words">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex min-w-[80px] flex-col items-end gap-1">
                        <span
                          className={`text-right whitespace-nowrap ${item.isPaid ? "line-through-gray" : ""}`}
                        >
                          {formatCurrency(item.amount)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Editar parcela"
                            onClick={() => {
                              setSelectedInstallment(item);
                              setIsDialogOpen(true);
                            }}
                          >
                            <span className="sr-only">Editar</span>
                            ✏️
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Excluir parcela"
                            onClick={async () => {
                              await actionDeleteProductPurchaseInstallment(
                                item.id,
                              );
                              toast.success("Parcela excluída.");
                              // Optionally: refresh UI
                            }}
                          >
                            <span className="sr-only">Excluir</span>
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Dialog for editing installment (to be implemented, or reuse existing patterns) */}
                {selectedInstallment && isDialogOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="min-w-[300px] rounded bg-white p-4 shadow">
                      <h3 className="mb-2 text-lg font-bold">Editar Parcela</h3>
                      {/* Implement edit form or reuse a dialog component if available */}
                      <p className="mb-2 text-sm">
                        Funcionalidade de edição a ser implementada.
                      </p>
                      <Button
                        onClick={() => {
                          setIsDialogOpen(false);
                          setSelectedInstallment(null);
                        }}
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
