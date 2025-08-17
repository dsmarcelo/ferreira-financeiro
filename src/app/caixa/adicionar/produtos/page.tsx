"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";
import { cn, formatCurrency } from "@/lib/utils";

export default function ProductSelectionPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Array<{ id: number; name: string; price: string; quantity: number }>>([]);
  const [selected, setSelected] = useState<Record<number, { quantity: number; unitPrice: number }>>({});

  // Load products
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/produtos", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as unknown;
        if (Array.isArray(data)) {
          const safe = (data as unknown[])
            .map((it) => {
              const obj = it as Record<string, unknown>;
              const id = typeof obj.id === "number" ? obj.id : Number(obj.id);
              let name = "";
              if (typeof obj.name === "string") name = obj.name;
              let price = "0";
              if (typeof obj.price === "string") price = obj.price;
              else if (typeof obj.price === "number") price = obj.price.toFixed(2);
              const quantity = typeof obj.quantity === "number" ? obj.quantity : Number(obj.quantity ?? 0);
              return { id, name, price, quantity };
            })
            .filter(
              (p) => Number.isFinite(p.id) && p.name.length > 0 && Number.isFinite(p.quantity),
            );
          setProducts(safe);
        } else {
          setProducts([]);
        }
      } catch {
        // ignore
      }
    })();
  }, []);



    // Load previous selections from localStorage
  useEffect(() => {
    const savedSelection = localStorage.getItem("income-selected-products");

    if (savedSelection) {
      try {
        const parsed = JSON.parse(savedSelection) as unknown;
        if (parsed && typeof parsed === "object") {
          const validSelection: Record<number, { quantity: number; unitPrice: number }> = {};
          for (const [key, value] of Object.entries(parsed)) {
            const productId = Number(key);
            if (Number.isFinite(productId) && value && typeof value === "object") {
              const obj = value as Record<string, unknown>;
              const quantity = typeof obj.quantity === "number" ? obj.quantity : 0;
              const unitPrice = typeof obj.unitPrice === "number" ? obj.unitPrice : 0;
              if (quantity > 0) {
                validSelection[productId] = { quantity, unitPrice };
              }
            }
          }
          setSelected(validSelection);
        }
      } catch {}
    }
  }, []);

  const totalSelectedValue = useMemo(() => {
    return Object.entries(selected).reduce((acc, [_productId, data]) => {
      const unit = data.unitPrice ?? 0;
      const qty = data.quantity ?? 0;
      return acc + unit * qty;
    }, 0);
  }, [selected]);

  const addItem = (productId: number, unitPrice: number) => {
    setSelected((prev) => {
      const current = prev[productId]?.quantity ?? 0;
      const product = products.find((p) => p.id === productId);
      const maxQty = product ? product.quantity : 0;
      const next = Math.min(current + 1, maxQty);
      return { ...prev, [productId]: { quantity: next, unitPrice } };
    });
  };

  const removeItem = (productId: number) => {
    setSelected((prev) => {
      const current = prev[productId]?.quantity ?? 0;
      const next = Math.max(current - 1, 0);
      const unitPrice = prev[productId]?.unitPrice ?? 0;
      const clone: typeof prev = { ...prev, [productId]: { quantity: next, unitPrice } };
      if (next === 0) delete clone[productId];
      return clone;
    });
  };

    const handleSaveAndReturn = () => {
    // Save selections to localStorage
    localStorage.setItem("income-selected-products", JSON.stringify(selected));

    // Navigate back
    router.back();
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Selecionar Produtos</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>

      {products.length > 0 && (
        <div className="space-y-4">
          <Label>Produtos Disponíveis</Label>
          <div className="grid grid-cols-1 gap-2">
            {products.map((p) => {
              const selectedData = selected[p.id] ?? { quantity: 0, unitPrice: Number(p.price) };
              const available = p.quantity;
              const canAdd = selectedData.quantity < available;
              return (
                <div key={p.id} className={cn("flex items-center justify-between rounded-md border p-3", selectedData.quantity > 0 ? "bg-slate-50" : "")}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-slate-500">
                      Preço {formatCurrency(Number(p.price))} • Estoque {available}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CurrencyInput
                      name={`unitPrice-${p.id}`}
                      value={selectedData.unitPrice}
                      onValueChange={(value) => setSelected((prev) => ({ ...prev, [p.id]: { quantity: selectedData.quantity, unitPrice: value ?? 0 } }))}
                      className="w-24"
                      min={0}
                      defaultValue={Number(p.price)}
                    />
                    <Button type="button" size="icon" variant="outline" onClick={() => removeItem(p.id)} disabled={selectedData.quantity === 0} aria-label="Remover">
                      -
                    </Button>
                    <span className="w-6 text-center tabular-nums">{selectedData.quantity}</span>
                    <Button type="button" size="icon" onClick={() => addItem(p.id, selectedData.unitPrice)} disabled={!canAdd} aria-label="Adicionar">
                      +
                    </Button>
                  </div>
                </div>
              );
            })}
                    </div>

          <div className="border-t pt-4">
            <div className="text-lg font-bold text-slate-800">Total: <span className="font-bold">{formatCurrency(totalSelectedValue)}</span></div>
          </div>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={() => router.back()} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleSaveAndReturn} className="flex-1">
          Salvar e Continuar
        </Button>
      </div>
    </div>
  );
}
