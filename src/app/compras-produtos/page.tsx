import AddProductPurchase from "@/app/_components/dialogs/add-product-purchase";
import { listProductPurchases } from "@/server/queries/product-purchase-queries";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import Header from "../_components/header";
import { DatePicker } from "@/app/_components/date-picker";
import { ptBR } from "date-fns/locale";
import EditProductPurchase from "@/app/_components/dialogs/edit-product-purchase";
// import EditProductPurchase from "@/app/_components/dialogs/edit-product-purchase"; // Not implemented yet

export default async function ComprasProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ date: string }>;
}) {
  const { date } = await searchParams;
  const productPurchases = await listProductPurchases(date);
  return (
    <div className="flex min-h-screen flex-col pb-5">
      <div>
        <Header className="flex-none">
          <div className="hidden sm:block">
            <AddProductPurchase />
          </div>
          <div className="sm:hidden"></div>
        </Header>
        <DatePicker />
      </div>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <div className="mx-auto w-full divide-y">
          {productPurchases.map((purchase) => (
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
      </main>
      <div className="block w-full px-5 sm:hidden">
        <AddProductPurchase className="w-full" />
      </div>
    </div>
  );
}
