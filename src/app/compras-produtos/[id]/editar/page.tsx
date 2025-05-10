import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductPurchaseWithInstallments } from "@/server/queries/product-purchase-queries";
import EditProductPurchaseForm from "@/app/_components/forms/edit-product-purchase-form";

interface EditProductPurchasePageProps {
  params: { id: string };
}

export default async function EditProductPurchasePage({ params }: EditProductPurchasePageProps) {
  const id = Number(params.id);
  if (!id) return notFound();
  const purchase = await getProductPurchaseWithInstallments(id);
  if (!purchase) return notFound();

  return (
    <main className="max-w-2xl mx-auto p-4">
      <header className="flex items-center gap-4 mb-6">
        <Link href="/compras-produtos" className="inline-flex items-center px-3 py-2 rounded bg-muted hover:bg-muted/80 border text-sm font-medium">
          ← Voltar
        </Link>
        <h1 className="text-xl font-bold">Editar Compra de Produto</h1>
      </header>
      <EditProductPurchaseForm productPurchase={purchase} />
    </main>
  );
}
