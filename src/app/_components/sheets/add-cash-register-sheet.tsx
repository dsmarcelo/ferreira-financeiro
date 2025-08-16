"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/inputs/date-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useActionState, useEffect as useReactEffect } from "react";
import { actionCreateCashRegister, type ActionResponse } from "@/actions/cash-register-actions";
import { toast } from "sonner";

export default function AddCashRegisterSheet({
  buttonLabel = "Adicionar Caixa",
  children,
}: {
  buttonLabel?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionCreateCashRegister,
    { success: false, message: "" },
  );

  useReactEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
      setOpen(false);
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const [products, setProducts] = useState<Array<{ id: number; name: string; price: string; quantity: number }>>([]);
  const [selected, setSelected] = useState<Record<number, { quantity: number; unitPrice: number }>>({});
  const [extraValue, setExtraValue] = useState<string>("0");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/produtos", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as unknown;
        if (Array.isArray(data)) {
          const safe = (data as unknown[]).map((it) => {
            const obj = it as Record<string, unknown>;
            const id = typeof obj.id === "number" ? obj.id : Number(obj.id);
            const name = typeof obj.name === "string" ? obj.name : "";
            let price = "0";
            if (typeof obj.price === "string") price = obj.price;
            else if (typeof obj.price === "number") price = obj.price.toFixed(2);
            const quantity = typeof obj.quantity === "number" ? obj.quantity : Number(obj.quantity ?? 0);
            return { id, name, price, quantity };
          }).filter((p) => Number.isFinite(p.id) && p.name.length > 0);
          setProducts(safe);
        }
      } catch {}
    })();
  }, []);

  const totalFromItems = useMemo(() => {
    return Object.entries(selected).reduce((acc, [id, data]) => {
      return acc + (data.unitPrice ?? 0) * (data.quantity ?? 0);
    }, 0);
  }, [selected]);

  const total = useMemo(() => {
    return totalFromItems + Number(extraValue || 0);
  }, [totalFromItems, extraValue]);

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button className="rounded-full">{buttonLabel}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Caixa</DialogTitle>
          <DialogDescription className="hidden" aria-hidden="true" />
        </DialogHeader>
        <form id="add-cash-form" action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <DatePicker id="date" name="date" required defaultValue={today} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extraValue">Valor Extra</Label>
              <Input id="extraValue" name="extraValue" type="number" min={0} step="0.01" value={extraValue} onChange={(e) => setExtraValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalValue">Valor Total (sem itens)</Label>
              <Input id="totalValue" name="totalValue" type="number" min={0} step="0.01" placeholder="Opcional se adicionar itens" />
            </div>
          </div>

          {products.length > 0 && (
            <div className="space-y-3">
              <Label>Itens vendidos (preço unitário pode ser editado)</Label>
              <div className="grid gap-2">
                {products.map((p) => {
                  const selectedData = selected[p.id] ?? { quantity: 0, unitPrice: Number(p.price) };
                  const canAdd = selectedData.quantity < p.quantity;
                  return (
                    <div key={p.id} className="flex flex-col gap-2 rounded-md border p-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-slate-500">Preço base {p.price} • Estoque {p.quantity}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Label className="text-xs">Preço</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          className="w-24"
                          value={selectedData.unitPrice}
                          onChange={(e) =>
                            setSelected((prev) => ({
                              ...prev,
                              [p.id]: {
                                unitPrice: Number(e.target.value || 0),
                                quantity: selectedData.quantity,
                              },
                            }))
                          }
                        />
                        <Label className="text-xs">Qtd</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              setSelected((prev) => {
                                const curr = prev[p.id]?.quantity ?? 0;
                                const next = Math.max(0, curr - 1);
                                const nextData = { unitPrice: selectedData.unitPrice, quantity: next };
                                const clone = { ...prev, [p.id]: nextData };
                                if (next === 0) delete clone[p.id];
                                return clone;
                              })
                            }
                            disabled={selectedData.quantity === 0}
                            aria-label="Diminuir"
                          >-</Button>
                          <span className="w-6 text-center tabular-nums">{selectedData.quantity}</span>
                          <Button
                            type="button"
                            size="icon"
                            onClick={() =>
                              setSelected((prev) => ({
                                ...prev,
                                [p.id]: {
                                  unitPrice: selectedData.unitPrice,
                                  quantity: Math.min(selectedData.quantity + 1, p.quantity),
                                },
                              }))
                            }
                            disabled={!canAdd}
                            aria-label="Aumentar"
                          >+</Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <input
                type="hidden"
                name="soldItemsJson"
                value={JSON.stringify(
                  Object.entries(selected).map(([productId, data]) => ({
                    productId: Number(productId),
                    quantity: data.quantity,
                    unitPrice: data.unitPrice,
                  })),
                )}
              />
              <div className="text-sm text-slate-600">Total dos itens: {totalFromItems.toFixed(2)} | Total final: {total.toFixed(2)}</div>
            </div>
          )}
        </form>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" form="add-cash-form" disabled={pending}>
            {pending ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


