import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductPurchaseWithInstallments } from "@/server/queries/product-purchase-queries";
import EditProductPurchaseForm from "@/app/_components/forms/edit-product-purchase-form";

interface EditProductPurchasePageProps {
  params: { id: string };
}

export default async function EditProductPurchasePage({
  params,
}: EditProductPurchasePageProps) {
  const id = Number(params.id);
  if (!id) return notFound();
  const purchase = await getProductPurchaseWithInstallments(id);
  if (!purchase) return notFound();

  return (
    <main className="mx-auto max-w-2xl p-4">
      <header className="mb-6 flex items-center gap-4">
        <Link
          href="/compras-produtos"
          className="bg-muted hover:bg-muted/80 inline-flex items-center rounded border px-3 py-2 text-sm font-medium"
        >
          ← Voltar
        </Link>
        <h1 className="text-xl font-bold">Editar Compra de Produto</h1>
      </header>
      <EditProductPurchaseForm productPurchase={purchase} />
    </main>
  );
}
