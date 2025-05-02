"use client";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditProductPurchase from "../dialogs/edit/edit-product-purchase";
import { formatCurrency } from "@/lib/utils";
import { ExpenseListItem } from "./expense-list-item";
import { actionToggleProductPurchaseIsPaid } from "@/actions/product-purchase-actions";
import type { ProductPurchase } from "@/server/db/schema/product-purchase";
import { use } from "react";
import DownloadButton from "../buttons/download-button";
import ShareButton from "../buttons/share-button";

// Helper to group purchases by date string (YYYY-MM-DD)
function groupByDate(purchases: ProductPurchase[]) {
  return purchases
    .sort((a, b) =>
      a.date === b.date
        ? a.id.localeCompare(b.id)
        : a.date.localeCompare(b.date),
    )
    .reduce<Record<string, ProductPurchase[]>>((acc, purchase) => {
      const date = purchase.date;
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
  const allProductPurchases = use(productPurchases);
  const grouped = groupByDate(allProductPurchases);
  const sortedDates = Object.keys(grouped).sort();

  const total = allProductPurchases.reduce(
    (acc, item) => acc + Number(item.value),
    0,
  );
  const totalPaid = allProductPurchases.filter((item) => item.isPaid).reduce((acc, item) => acc + Number(item.value), 0);
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
                      0,
                    ) ?? 0,
                  )}
                  )
                </p>
              </div>
              <div className="flex w-full flex-col justify-between divide-y divide-gray-100">
                {grouped[date]?.map((item) => (
                  <EditProductPurchase data={item} key={item.id}>
                    <div>
                      <ExpenseListItem
                        expense={item}
                        onTogglePaid={(id: string, checked: boolean) => {
                          void actionToggleProductPurchaseIsPaid(id, checked);
                        }}
                      />
                    </div>
                  </EditProductPurchase>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
