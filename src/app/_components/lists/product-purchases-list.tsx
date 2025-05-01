import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditProductPurchase from "../dialogs/edit/edit-product-purchase";
import { formatCurrency } from "@/lib/utils";
import type { ProductPurchase } from "@/server/db/schema/product-purchase";
import { use } from "react";

// Helper to group purchases by date string (YYYY-MM-DD)
function groupByDate(purchases: ProductPurchase[]) {
  return purchases.reduce<Record<string, ProductPurchase[]>>(
    (acc, purchase) => {
      const date = purchase.date;
      acc[date] ??= [];
      acc[date].push(purchase);
      return acc;
    },
    {},
  );
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

  return (
    <div className="mx-auto w-full divide-y">
      {/* Iterate over each date group */}
      {sortedDates.map((date) => (
        <div key={date} className="py-1">
          {/* Date label, styled as in the image */}
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
            <span className="w-12">
              {format(parseISO(date), "dd MMM", { locale: ptBR }).toUpperCase()}
            </span>
            {/* Only show the first description inline, others below */}
            <span className="flex-1 font-normal text-black/80">
              {grouped[date]?.[0]?.description ?? ""}
            </span>
            <span className="min-w-[80px] text-right font-medium">
              {formatCurrency(grouped[date]?.[0]?.value ?? 0)}
            </span>
          </div>
          {/* Render additional descriptions for this date, if any */}
          {(grouped[date]?.slice(1) ?? []).map((purchase) => (
            <EditProductPurchase data={purchase} key={purchase.id}>
              <div className="text-muted-foreground flex items-center gap-2 pl-12 text-xs font-medium">
                <span className="flex-1 font-normal text-black/80">
                  {purchase.description}
                </span>
                <span className="min-w-[80px] text-right font-medium">
                  {formatCurrency(purchase.value)}
                </span>
              </div>
            </EditProductPurchase>
          ))}
        </div>
      ))}
    </div>
  );
}
