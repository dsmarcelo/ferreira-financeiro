import AddProductPurchase from "@/app/_components/dialogs/add/add-product-purchase";
import { listProductPurchases } from "@/server/queries/product-purchase-queries";
import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import ProductPurchasesList from "@/app/_components/lists/product-purchases-list";

export default async function ComprasProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ date: string }>;
}) {
  const { date } = await searchParams;
  const productPurchases = listProductPurchases(date);
  return (
    <div className="flex min-h-screen flex-col pb-5">
      <div>
        <Header className="flex-none">
          <div className="hidden sm:block">
            <AddProductPurchase />
          </div>
          <div className="sm:hidden"></div>
        </Header>
      </div>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <Suspense fallback={<Loading />}>
          <ProductPurchasesList productPurchases={productPurchases} />
        </Suspense>
      </main>
      <div className="block w-full px-5 sm:hidden">
        <AddProductPurchase className="w-full" />
      </div>
    </div>
  );
}
