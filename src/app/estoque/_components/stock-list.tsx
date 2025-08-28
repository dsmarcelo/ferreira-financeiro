"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/server/db/schema/products";
import { useActionState } from "react";
import { actionUpdateProduct, type ActionResponse } from "@/actions/product-actions";
import { toast } from "sonner";

interface StockListProps {
  products: Product[];
}

export default function StockList({ products }: StockListProps) {
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [updateState, updateAction, updating] = useActionState<ActionResponse, FormData>(
    actionUpdateProduct,
    { success: false, message: "" },
  );

  useEffect(() => {
    if (!updateState) return;
    if (updateState.success) {
      toast.success(updateState.message || "Produto atualizado");
      setEditOpen(false);
      setEditingId(null);
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
  };

  const handleDelta = (id: number, delta: number) => {
    setLocalProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(0, (p.quantity ?? 0) + delta) } : p,
      ),
    );
  };

  return (
    <div className="divide-y rounded-md border">
      {localProducts.length === 0 ? (
        <div className="p-4 text-sm text-slate-600">Nenhum produto cadastrado.</div>
      ) : (
        localProducts.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2 p-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Input
                defaultValue={p.name}
                onBlur={(e) => {
                  const form = new FormData();
                  form.set("id", String(p.id));
                  form.set("name", e.target.value);
                  form.set("quantity", String(p.quantity ?? 0));
                  form.set("price", String(Number(p.price) || 0));
                  form.set("cost", String(Number(p.cost) || 0));
                  void updateAction(form);
                }}
                className="border-input bg-background w-full rounded-md border px-2 py-1 text-sm"
              />
              <span className="text-xs text-slate-500">
                Preço: R$ {Number(p.price).toFixed(2)} • Custo: R$ {Number(p.cost).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button type="button" variant="outline" size="icon" onClick={() => handleDelta(p.id, -1)}>
                -
              </Button>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={p.quantity ?? 0}
                onChange={(e) => handleSetQuantity(p.id, Number.parseInt(e.target.value) || 0)}
                onBlur={(e) => {
                  const form = new FormData();
                  form.set("id", String(p.id));
                  form.set("name", p.name);
                  form.set("quantity", String(Math.max(0, Number(e.target.value) || 0)));
                  form.set("price", String(Number(p.price) || 0));
                  form.set("cost", String(Number(p.cost) || 0));
                  void updateAction(form);
                }}
                className="border-input bg-background min-w-14 rounded-md border px-1 py-1 text-center text-sm"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => handleDelta(p.id, 1)}>
                +
              </Button>
            </div>
            <div className="pl-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingId(p.id);
                  setEditOpen(true);
                }}
              >
                Editar
              </Button>
            </div>
          </div>
        ))
      )}

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setEditingId(null); }}>
        <DialogContent className="gap-3 p-4">
          <DialogHeader>
            <DialogTitle>Editar produto</DialogTitle>
          </DialogHeader>

          {editingId != null && (() => {
            const prod = localProducts.find((pp) => pp.id === editingId);
            if (!prod) return null;
            return (
              <form action={updateAction} className="space-y-3">
                <input type="hidden" name="id" value={prod.id} />
                <input type="hidden" name="price" value={Number(prod.price) || 0} />
                <input type="hidden" name="cost" value={Number(prod.cost) || 0} />

                <div className="space-y-1">
                  <label htmlFor="edit-name" className="text-sm font-medium">Nome</label>
                  <Input id="edit-name" name="name" defaultValue={prod.name} required />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-quantity" className="text-sm font-medium">Quantidade em estoque</label>
                  <Input id="edit-quantity" name="quantity" type="number" min="0" defaultValue={prod.quantity} required />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={updating}>
                    {updating ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}


