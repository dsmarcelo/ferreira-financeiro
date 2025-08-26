import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { type Product } from "@/hooks/use-income-data";

interface IncomeProductSelectionProps {
  products: Product[];
  selectedProducts: Record<number, { quantity: number; unitPrice: number }>;
}

export function IncomeProductSelection({
  products,
  selectedProducts,
}: IncomeProductSelectionProps) {
  const router = useRouter();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Produtos</Label>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/caixa/adicionar/produtos")}
        >
          {Object.keys(selectedProducts).length > 0
            ? "Editar Produtos"
            : "Adicionar Produtos"}
        </Button>
      </div>

      {Object.keys(selectedProducts).length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {products
            .filter(
              (p) =>
                selectedProducts[p.id] && selectedProducts[p.id]!.quantity > 0,
            )
            .map((p) => {
              const selectedData = selectedProducts[p.id];
              if (!selectedData) return null;
              const available = p.quantity;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border bg-slate-50 p-1 px-3"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <p className="font-medium">
                        {selectedData.quantity} x {p.name}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      Preço {formatCurrency(Number(selectedData.unitPrice))} •
                      Em estoque: {available}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
