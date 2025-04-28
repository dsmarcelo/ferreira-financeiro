import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditProductPurchase from "../dialogs/edit-product-purchase";
import { formatCurrency } from "@/lib/utils";
import type { ProductPurchase } from "@/server/db/schema/product-purchase";
import { use } from "react";

/**
 * Renders a list of product purchases.
 * Uses Suspense for loading states. Receives a promise of ProductPurchase[].
 */
export default function ProductPurchasesList({
  productPurchases,
}: {
  productPurchases: Promise<ProductPurchase[]>;
}) {
  // Resolve the promise to get the data array
  const allProductPurchases = use(productPurchases);

  return (
    <div className="mx-auto w-full divide-y">
      {allProductPurchases.map((purchase) => (
        <EditProductPurchase data={purchase} key={purchase.id}>
          <div className="active:bg-accent flex cursor-pointer justify-between gap-4 py-2">
            <p>
              {format(parseISO(purchase.date), "dd MMM", {
                locale: ptBR,
              }).toUpperCase()}
            </p>
            <p>{formatCurrency(purchase.value)}</p>
          </div>
        </EditProductPurchase>
      ))}
    </div>
  );
}
