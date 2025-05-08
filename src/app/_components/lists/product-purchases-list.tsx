"use client";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditProductPurchase from "../dialogs/edit/edit-product-purchase";
import { useState } from "react";
import { actionGetProductPurchaseWithInstallments } from "@/actions/product-purchase-actions";
import type { ProductPurchaseWithInstallments } from "@/server/db/schema/product-purchase";
import { formatCurrency } from "@/lib/utils";
import { ExpenseListItem } from "./expense-list-item";
import { actionToggleProductPurchaseIsPaid } from "@/actions/product-purchase-actions";
import type { ProductPurchase } from "@/server/db/schema/product-purchase";
import { startTransition, useOptimistic, use } from "react";
import DownloadButton from "../buttons/download-button";
import ShareButton from "../buttons/share-button";
import {
  downloadProductPurchasesPDF,
  shareProductPurchasesPDF,
} from "@/lib/pdf/product-purchases-pdf";
import { getSelectedMonth } from "@/lib/utils";

// Helper to group purchases by date string (YYYY-MM-DD)
import { compareByDueDateAndId } from "./utils/compare";

function groupByDate(purchases: ProductPurchase[]) {
  return purchases
    .sort(compareByDueDateAndId)
    .reduce<Record<string, ProductPurchase[]>>((acc, purchase) => {
      // Use createdAt as grouping date, formatted as YYYY-MM-DD
      const createdAt = purchase.createdAt as string | Date;
      const date =
        typeof createdAt === "string"
          ? createdAt.slice(0, 10)
          : createdAt instanceof Date
            ? createdAt.toISOString().slice(0, 10)
            : "";
      acc[date] ??= [];
      acc[date].push(purchase);
      return acc;
    }, {});
}

/**
 * Renders a list of product purchases.
 * Uses Suspense for loading states. Receives a promise of ProductPurchase[].
 */
export default function ProductPurchasesList({
  productPurchases,
}: {
  productPurchases: Promise<ProductPurchase[]>;
}) {
  const [selectedPurchase, setSelectedPurchase] =
    useState<ProductPurchaseWithInstallments | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const allProductPurchases = use(productPurchases);

  // useOptimistic for optimistic paid state
  const [optimisticPurchases, setOptimisticPurchases] = useOptimistic(
    allProductPurchases,
    (state: ProductPurchase[], update: { id: number; checked: boolean }) =>
      state.map((item) =>
        item.id === update.id ? { ...item, isPaid: update.checked } : item,
      ),
  );

  const grouped = groupByDate(optimisticPurchases);
  const sortedDates = Object.keys(grouped).sort();

  const selectedMonth = getSelectedMonth();

  const total = allProductPurchases.reduce(
    (acc, item) => acc + Number(item.totalAmount),
    0,
  );
  const totalPaid = allProductPurchases
    .filter((item) => item.isPaid)
    .reduce((acc, item) => acc + Number(item.totalAmount), 0);
  const totalUnpaid = total - totalPaid;

  if (allProductPurchases.length === 0) {
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
          <DownloadButton
            onClick={() =>
              downloadProductPurchasesPDF(
                allProductPurchases,
                `Compras de Produtos - ${selectedMonth}`,
              )
            }
          />
          <ShareButton
            onClick={() =>
              shareProductPurchasesPDF(
                allProductPurchases,
                `Compras de Produtos - ${selectedMonth}`,
              )
            }
          />
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
                      (acc, item) => acc + Number(item.totalAmount),
                      0,
                    ) ?? 0,
                  )}
                  )
                </p>
              </div>
              <div className="flex w-full flex-col justify-between divide-y divide-gray-100">
                {grouped[date]?.map((item) => (
                  <div key={item.id}>
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={async () => {
                        const purchaseWithInstallments =
                          await actionGetProductPurchaseWithInstallments(
                            item.id,
                          );
                        if (purchaseWithInstallments) {
                          setSelectedPurchase(purchaseWithInstallments);
                          setIsDialogOpen(true);
                        }
                      }}
                    >
                      <ExpenseListItem
                        expense={item}
                        onTogglePaid={(id: number, checked: boolean) => {
                          startTransition(() => {
                            setOptimisticPurchases({ id, checked });
                          });
                          void actionToggleProductPurchaseIsPaid(id, checked);
                        }}
                      />
                    </button>
                  </div>
                ))}
                {selectedPurchase && (
                  <EditProductPurchase
                    data={selectedPurchase}
                    open={isDialogOpen}
                    onOpenChange={(open: boolean) => {
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
