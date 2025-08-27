"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";
import { formatCurrency } from "@/lib/utils";
import { type Product } from "@/hooks/use-income-data";
import { Trash2 } from "lucide-react";
import { DeleteDialog } from "@/app/_components/dialogs/delete-dialog";
import { Input } from "@/components/ui/input";

interface IncomeProductEditorProps {
  products: Product[];
  selectedProducts: Record<number, { quantity: number; unitPrice: number }>;
  onChange: (
    next: Record<number, { quantity: number; unitPrice: number }>,
  ) => void;
  // For edit context: original quantities linked to this income, to allow
  // stock calculation as: available = stock + originalQty - selectedQty
  originalQuantities?: Record<number, number>;
}

export function IncomeProductEditor({
  products,
  selectedProducts,
  onChange,
  originalQuantities,
}: IncomeProductEditorProps) {
  const [productToAdd, setProductToAdd] = useState<number | "">("");

  const selectableProducts = useMemo(() => {
    return products;
  }, [products]);

  const handleAddProduct = () => {
    if (productToAdd === "") return;
    const pid = Number(productToAdd);
    const product = products.find((p) => p.id === pid);
    if (!product) return;
    const defaultPrice = Number(product.price);
    const current = selectedProducts[pid];
    const nextQuantity = (current?.quantity ?? 0) + 1;
    onChange({
      ...selectedProducts,
      [pid]: {
        quantity: nextQuantity,
        unitPrice: current?.unitPrice ?? defaultPrice,
      },
    });
    setProductToAdd("");
  };

  const handleRemove = (productId: number) => {
    const { [productId]: _omit, ...rest } = selectedProducts;
    onChange(rest);
  };

  const getAvailable = (productId: number): number => {
    const prod = products.find((p) => p.id === productId);
    const stock = prod ? prod.quantity : 0;
    const originalQty = originalQuantities?.[productId] ?? 0;
    const selectedQty = selectedProducts[productId]?.quantity ?? 0;
    return stock + originalQty - selectedQty;
  };

  const handleQtyChange = (productId: number, delta: number) => {
    const entry = selectedProducts[productId];
    if (!entry) return;
    if (delta > 0) {
      // Enforce stock constraint
      if (getAvailable(productId) <= 0) return;
    }
    const nextQty = Math.max(0, (entry.quantity ?? 0) + delta);
    const next = { ...selectedProducts };
    if (nextQty === 0) delete next[productId];
    else next[productId] = { ...entry, quantity: nextQty };
    onChange(next);
  };

  const handlePriceChange = (productId: number, price: number | undefined) => {
    const entry = selectedProducts[productId];
    if (!entry) return;
    const next = {
      ...selectedProducts,
      [productId]: { ...entry, unitPrice: price ?? 0 },
    };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Produtos</Label>
        <div className="flex items-center gap-2">
          <select
            className="border-input focus-visible:border-primary bg-background placeholder:text-muted-foreground h-9 rounded-md border px-2 text-base shadow-xs focus-visible:border focus-visible:outline-none"
            value={productToAdd}
            onChange={(e) =>
              setProductToAdd(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
          >
            <option value="">Selecionar produto…</option>
            {selectableProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatCurrency(Number(p.price))}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" onClick={handleAddProduct}>
            Adicionar
          </Button>
        </div>
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
              const available = getAvailable(p.id);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border bg-slate-50 p-1 px-3"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{p.name}</p>
                      <span className="text-xs text-slate-500">
                        Em estoque: {available}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleQtyChange(p.id, -1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          max={getAvailable(p.id) + selectedData.quantity}
                          value={selectedData.quantity}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 0;
                            const available =
                              getAvailable(p.id) + selectedData.quantity;
                            const clampedQty = Math.min(
                              Math.max(0, newQty),
                              available,
                            );
                            const next = { ...selectedProducts };
                            if (clampedQty === 0) delete next[p.id];
                            else
                              next[p.id] = {
                                ...selectedData,
                                quantity: clampedQty,
                              };
                            onChange(next);
                          }}
                          className="border-input bg-background min-w-10 rounded-md border px-1 py-1 text-center text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleQtyChange(p.id, 1)}
                          size="icon"
                        >
                          +
                        </Button>
                      </div>

                      <div className="w-40">
                        <CurrencyInput
                          name={`price-${p.id}-editor`}
                          value={Number(selectedData.unitPrice)}
                          onValueChange={(v) => handlePriceChange(p.id, v)}
                        />
                      </div>
                    </div>
                  </div>

                  <DeleteDialog
                    onConfirm={() => handleRemove(p.id)}
                    title="Remover produto"
                    description={`Tem certeza que deseja remover "${p.name}" da lista?`}
                    confirmText="Remover"
                    triggerText={<Trash2 className="h-4 w-4" />}
                  />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
