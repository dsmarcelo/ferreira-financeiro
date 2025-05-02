import AddProductPurchase from "@/app/_components/dialogs/add/add-product-purchase";
import { Button } from "@/components/ui/button";
import { listProductPurchases } from "@/server/queries/product-purchase-queries";
import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import ProductPurchasesList from "@/app/_components/lists/product-purchases-list";

export default async function ComprasProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ from: string; to: string }>;
}) {
  const { from, to } = await searchParams;
  const productPurchases = listProductPurchases(from, to);

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <Header className="sticky top-0 z-50 flex-none">
        <div className="hidden sm:block">
          <AddProductPurchase>
            <Button className="rounded-full">
              Adicionar Compra de Produto
            </Button>
          </AddProductPurchase>
        </div>
      </Header>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <Suspense fallback={<Loading />}>
          <ProductPurchasesList productPurchases={productPurchases} />
        </Suspense>
      </main>
      <div className="fixed bottom-24 block w-full px-5 sm:hidden">
        <AddProductPurchase>
          <Button className="h-12 w-full rounded-full">
            Adicionar Compra de Produto
          </Button>
        </AddProductPurchase>
      </div>
    </div>
  );
}
