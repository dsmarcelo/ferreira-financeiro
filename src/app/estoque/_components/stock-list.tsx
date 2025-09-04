"use client";

import { useState, useEffect, startTransition } from "react";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import type { Product } from "@/server/db/schema/products-schema";
import { useActionState } from "react";
import {
  actionUpdateProduct,
  type ActionResponse,
} from "@/actions/product-actions";
import { toast } from "sonner";
import { DeleteDialog } from "@/app/_components/dialogs/delete-dialog";
import { actionDeleteStock } from "@/actions/stock-actions";
import QuantityControl from "./quantity-control";
import AddProduct from "@/app/_components/dialogs/add/add-product";
import { Button } from "@/components/ui/button";

interface StockListProps {
  products: Product[];
}

export default function StockList({ products }: StockListProps) {
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [updateState, updateAction] = useActionState<ActionResponse, FormData>(
    actionUpdateProduct,
    { success: false, message: "" },
  );

  // Track which product ids have unsaved changes
  const [dirtyIds, setDirtyIds] = useState<Set<number>>(new Set());

  const markDirty = (productId: number) => {
    setDirtyIds((prev) => new Set(prev).add(productId));
  };

  const submitProduct = (productId: number) => {
    const prod = localProducts.find((pp) => pp.id === productId);
    if (!prod) return;
    const form = new FormData();
    form.set("id", String(prod.id));
    form.set("name", prod.name);
    const qty = Math.max(0, Number(prod.quantity ?? 0));
    form.set("quantity", qty.toString());
    form.set("price", String(Number(prod.price) || 0));
    form.set("cost", String(Number(prod.cost) || 0));
    startTransition(() => {
      void updateAction(form);
    });
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

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
    const nextQty = Math.max(0, nextQtyRaw);
    setLocalProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: nextQty.toString() } : p,
      ),
    );
    markDirty(id);
  };

  // Calculate totals
  const totalStockCost = localProducts.reduce((sum, product) => {
    const quantity = Number(product.quantity) || 0;
    const cost = Number(product.cost) || 0;
    return sum + quantity * cost;
  }, 0);

  const totalStockPrice = localProducts.reduce((sum, product) => {
    const quantity = Number(product.quantity) || 0;
    const price = Number(product.price) || 0;
    return sum + quantity * price;
  }, 0);

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {localProducts.length === 0 ? (
        <div className="p-4 text-sm text-slate-600">
          Nenhum produto cadastrado.
        </div>
      ) : (
        <>
          {/* Total calculations header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div className="divide-y rounded-md bg-blue-50 py-2">
              <div className="grid grid-cols-2 divide-x pb-1">
                <div className="px-4 text-center">
                  <div className="text-sm text-slate-600">
                    Custo Total do Estoque
                  </div>
                  <div className="text-lg font-semibold text-blue-700">
                    {formatCurrency(totalStockCost)}
                  </div>
                </div>
                <div className="px-4 text-center">
                  <div className="text-sm text-slate-600">
                    Preço Total do Estoque
                  </div>
                  <div className="text-lg font-semibold text-green-700">
                    {formatCurrency(totalStockPrice)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 px-4 pt-1 text-center">
                <div className="text-sm text-slate-600">Lucro estimado</div>
                <div className="text-lg font-semibold text-green-700">
                  {formatCurrency(totalStockPrice - totalStockCost)}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <AddProduct>
                <Button className="rounded-full">Adicionar Produto</Button>
              </AddProduct>
            </div>
          </div>
          <div className="divide-y">
            {localProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-md"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1 bg-gray-50 p-2">
                  <div className="flex items-center justify-between gap-2 rounded-md bg-gray-50">
                    <Input
                      value={p.name}
                      onChange={(e) => {
                        const next = e.target.value;
                        setLocalProducts((prev) =>
                          prev.map((pp) =>
                            pp.id === p.id ? { ...pp, name: next } : pp,
                          ),
                        );
                        markDirty(p.id);
                      }}
                      className="border-input bg-background w-full rounded-md border px-2 py-1 text-sm"
                    />
                    <DeleteDialog
                      onConfirm={async () => {
                        // Optimistic update
                        setLocalProducts((prev) =>
                          prev.filter((pp) => pp.id !== p.id),
                        );
                        try {
                          await actionDeleteStock(p.id);
                          toast.success("Produto removido");
                        } catch (e) {
                          toast.error(
                            (e as Error)?.message ?? "Erro ao remover produto",
                          );
                          // Best-effort refetch to restore state if needed
                          try {
                            const res = await fetch("/api/produtos", {
                              cache: "no-store",
                            });
                            if (res.ok) {
                              const data = (await res.json()) as Product[];
                              setLocalProducts(data);
                            }
                          } catch {
                            // ignore
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="flex w-full gap-1">
                    <div className="flex w-full flex-col gap-1">
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
                          markDirty(p.id);
                        }}
                        className="h-9 w-full px-2 py-1"
                      />
                    </div>

                    <div className="flex w-full flex-col gap-1">
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
                          markDirty(p.id);
                        }}
                        className="h-9 w-full px-2 py-1"
                      />
                    </div>

                    <div className="flex w-fit items-end gap-1">
                      <QuantityControl
                        label="Estoque"
                        value={Number(p.quantity ?? 0)}
                        onChange={(value) => handleSetQuantity(p.id, value)}
                        showSubmit={dirtyIds.has(p.id)}
                        onSubmit={() => submitProduct(p.id)}
                      />
                    </div>
                  </div>
                  {/* Individual product calculations */}
                  <div className="flex w-full gap-2">
                    <div className="flex w-full flex-col gap-1">
                      <label className="text-xs text-slate-500">
                        Custo Total
                      </label>
                      <div className="flex w-full items-center rounded-md bg-slate-100 px-2 py-1 text-sm font-medium text-slate-700">
                        {formatCurrency(
                          (Number(p.quantity) || 0) * (Number(p.cost) || 0),
                        )}
                      </div>
                    </div>
                    <div className="flex w-full flex-col gap-1">
                      <label className="text-xs text-slate-500">
                        Preço Total
                      </label>
                      <div className="flex w-full items-center rounded-md bg-slate-100 px-2 py-1 text-sm font-medium text-slate-700">
                        {formatCurrency(
                          (Number(p.quantity) || 0) * (Number(p.price) || 0),
                        )}
                      </div>
                    </div>
                    <div className="flex w-fit items-end">
                      <div className="h-9 w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
