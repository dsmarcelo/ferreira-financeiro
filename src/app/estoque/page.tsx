import SubPageHeader from "@/app/_components/sub-page-header";
import { listProducts } from "@/server/queries/product-queries";
import AddProduct from "../_components/dialogs/add/add-product";
import { Button } from "@/components/ui/button";
import StockList from "./_components/stock-list";

export default async function EstoquePage() {
  const products = await listProducts();

  return (
    <div className="container mx-auto max-w-screen-lg space-y-6 p-4 pb-24">
      <SubPageHeader title="Estoque" />
      <StockList products={products} />
    </div>
  );
}
