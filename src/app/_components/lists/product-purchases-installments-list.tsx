"use client";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { useState, startTransition, useOptimistic, use } from "react";
import EditProductPurchase from "../dialogs/edit/edit-product-purchase";
import type { ProductPurchaseWithInstallments } from "@/server/db/schema/product-purchase";
import { formatCurrency } from "@/lib/utils";
import type { ProductPurchaseInstallment } from "@/server/db/schema/product-purchase";
import { actionUpdateProductPurchaseInstallment } from "@/actions/product-purchase-actions";
import DownloadButton from "../buttons/download-button";
import ShareButton from "../buttons/share-button";
// You may want to implement PDF helpers for installments, similar to purchases
// import { downloadInstallmentsPDF, shareInstallmentsPDF } from "@/lib/pdf/installments-pdf";
import { toast } from "sonner";
import { compareByDueDateAndId } from "@/app/_components/lists/utils/compare";
import Link from "next/link";
import { ExpenseListItem } from "./expense-list-item";

interface ProductPurchasesInstallmentsListProps {
  productPurchaseInstallments: Promise<ProductPurchaseInstallment[]>;
}

function groupInstallmentsByDate(installments: ProductPurchaseInstallment[]) {
  return installments
    .sort(compareByDueDateAndId)
    .reduce<Record<string, ProductPurchaseInstallment[]>>((acc, expense) => {
      const date = expense.dueDate;
      acc[date] ??= [];
      acc[date].push(expense);
      return acc;
    }, {});
}

export default function ProductPurchasesInstallmentsList({
  productPurchaseInstallments,
}: ProductPurchasesInstallmentsListProps) {
  const allInstallments = use(productPurchaseInstallments);
  const [selectedPurchase, setSelectedPurchase] =
    useState<ProductPurchaseWithInstallments | null>(null);
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
                  <Link
                    key={item.id}
                    href={`/compras-produtos/${item.productPurchaseId}/editar#installment-${item.id}`}
                    role="button"
                    tabIndex={0}
                    className="hover:bg-background-secondary active:bg-accent focus:ring-accent flex w-full cursor-pointer items-center gap-2 py-2 focus:ring-2 focus:outline-none sm:px-2"
                    aria-label={`Editar parcela ${item.installmentNumber}`}
                  >
                    <ExpenseListItem
                      installment={item}
                      onTogglePaid={(id, checked) => {
                        startTransition(() => {
                          setOptimisticInstallments({
                            id,
                            checked,
                          });
                        });
                        void actionUpdateProductPurchaseInstallment(id, {
                          isPaid: checked,
                        });
                      }}
                    />
                  </Link>
                ))}
                {/* EditProductPurchase Dialog for selected installment's purchase */}
                {selectedPurchase && isDialogOpen && (
                  <EditProductPurchase
                    data={selectedPurchase}
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) setSelectedPurchase(null);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
