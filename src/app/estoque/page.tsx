import SubPageHeader from "@/app/_components/sub-page-header";
import { listProducts } from "@/server/queries/product-queries";
import AddProduct from "../_components/dialogs/add/add-product";
import { Button } from "@/components/ui/button";

export default async function EstoquePage() {
  const products = await listProducts();

  return (
    <div className="container mx-auto max-w-screen-lg space-y-6 p-4 pb-24">
      <SubPageHeader title="Estoque" />
      <div className="flex justify-end">
        <AddProduct>
          <Button className="rounded-full">Adicionar Produto</Button>
        </AddProduct>
      </div>
      <div className="divide-y rounded-md border">
        {products.length === 0 ? (
          <div className="p-4 text-sm text-slate-600">Nenhum produto cadastrado.</div>
        ) : (
          products.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3">
              <div className="flex flex-col">
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-slate-500">Preço: R$ {Number(p.price).toFixed(2)} • Custo: R$ {Number(p.cost).toFixed(2)}</span>
              </div>
              <div className="text-sm">Qtd: <span className="font-medium">{p.quantity}</span></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


