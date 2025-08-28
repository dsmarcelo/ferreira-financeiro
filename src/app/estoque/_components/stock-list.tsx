"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import type { Product } from "@/server/db/schema/products";
import { useActionState } from "react";
import {
  actionUpdateProduct,
  type ActionResponse,
} from "@/actions/product-actions";
import { toast } from "sonner";

interface StockListProps {
  products: Product[];
}

export default function StockList({ products }: StockListProps) {
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [updateState, updateAction] = useActionState<ActionResponse, FormData>(
    actionUpdateProduct,
    { success: false, message: "" },
  );

  // Keep per-product debounce timers to batch quick edits
  const debounceTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Schedules a debounced save for a given product id
  const scheduleSave = (productId: number) => {
    const existing = debounceTimersRef.current.get(productId);
    if (existing) clearTimeout(existing);
    const timeoutId = setTimeout(() => {
      const prod = localProducts.find((pp) => pp.id === productId);
      if (!prod) return;
      const form = new FormData();
      form.set("id", String(prod.id));
      form.set("name", prod.name);
      form.set("quantity", String(Math.max(0, prod.quantity ?? 0)));
      form.set("price", String(Number(prod.price) || 0));
      form.set("cost", String(Number(prod.cost) || 0));
      void updateAction(form);
      debounceTimersRef.current.delete(productId);
    }, 1000);
    debounceTimersRef.current.set(productId, timeoutId);
  };

  // Clear any pending timers on unmount
  useEffect(() => {
    const timers = debounceTimersRef.current;
    return () => {
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
    };
  }, []);

  useEffect(() => {
    if (!updateState) return;
    if (updateState.success) {
      toast.success(updateState.message || "Produto atualizado");
      void (async () => {
        try {
          const res = await fetch("/api/produtos", { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as Product[];
            setLocalProducts(data);
          }
        } catch {
          // ignore
        }
      })();
    } else if (updateState.message) {
      toast.error(updateState.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateState.success, updateState.message]);

  const handleSetQuantity = (id: number, nextQtyRaw: number) => {
    const nextQty = Math.max(0, Math.floor(nextQtyRaw));
    setLocalProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: nextQty } : p)),
    );
    scheduleSave(id);
  };

  const handleDelta = (id: number, delta: number) => {
    setLocalProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, quantity: Math.max(0, (p.quantity ?? 0) + delta) }
          : p,
      ),
    );
    scheduleSave(id);
  };

  return (
    <div className="divide-y rounded-md border">
      {localProducts.length === 0 ? (
        <div className="p-4 text-sm text-slate-600">
          Nenhum produto cadastrado.
        </div>
      ) : (
        localProducts.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-2 p-3"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Input
                value={p.name}
                onChange={(e) => {
                  const next = e.target.value;
                  setLocalProducts((prev) =>
                    prev.map((pp) =>
                      pp.id === p.id ? { ...pp, name: next } : pp,
                    ),
                  );
                  scheduleSave(p.id);
                }}
                className="border-input bg-background w-full rounded-md border px-2 py-1 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">Preço</label>
                  <CurrencyInput
                    name={`price-${p.id}`}
                    value={Number(p.price) || 0}
                    min={0}
                    onValueChange={(val) => {
                      const numeric = typeof val === "number" ? val : 0;
                      setLocalProducts((prev) =>
                        prev.map((pp) =>
                          pp.id === p.id
                            ? {
                                ...pp,
                                price: numeric.toFixed(
                                  2,
                                ) as unknown as Product["price"],
                              }
                            : pp,
                        ),
                      );
                      scheduleSave(p.id);
                    }}
                    className="h-8 w-28 px-2 py-1 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">Custo</label>
                  <CurrencyInput
                    name={`cost-${p.id}`}
                    value={Number(p.cost) || 0}
                    min={0}
                    onValueChange={(val) => {
                      const numeric = typeof val === "number" ? val : 0;
                      setLocalProducts((prev) =>
                        prev.map((pp) =>
                          pp.id === p.id
                            ? {
                                ...pp,
                                cost: numeric.toFixed(
                                  2,
                                ) as unknown as Product["cost"],
                              }
                            : pp,
                        ),
                      );
                      scheduleSave(p.id);
                    }}
                    className="h-8 w-28 px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleDelta(p.id, -1)}
              >
                -
              </Button>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={p.quantity ?? 0}
                onChange={(e) =>
                  handleSetQuantity(p.id, Number.parseInt(e.target.value) || 0)
                }
                className="border-input bg-background min-w-14 rounded-md border px-1 py-1 text-center text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleDelta(p.id, 1)}
              >
                +
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
