"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  actionCreateIncome,
  type ActionResponse,
} from "@/actions/income-actions";
import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
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

interface AddIncomeFormProps {
  id?: string;
  onSuccess?: () => void;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function AddIncomeForm({ id, onSuccess }: AddIncomeFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionCreateIncome,
    initialState,
  );

  const [products, setProducts] = useState<Array<{ id: number; name: string; price: string; quantity: number }>>([]);
  const [selected, setSelected] = useState<Record<number, { quantity: number; unitPrice: number }>>({});
  const [discountType, setDiscountType] = useState<"percent" | "fixed" | "">("");
  const [discountValue, setDiscountValue] = useState<string>("0");
  const [customers, setCustomers] = useState<Array<{ id: number; name: string }>>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");

  // Handle success/error toasts and navigation
  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
      if (onSuccess) {
        onSuccess();
      } else {
        router.back();
      }
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state, onSuccess, router]);

  // Parse error messages from ActionResponse
  const errors = state?.errors ?? {};

  // Get today's date and current time in local timezone
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Sao_Paulo'
  });

  const currentTime = new Date().toLocaleTimeString('pt-BR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });

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

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/clientes", { cache: "no-store" });
        if (!res.ok) return;
        const list = (await res.json()) as Array<{ id: number; name: string }>;
        if (Array.isArray(list)) setCustomers(list);
      } catch {}
    })();
  }, []);

  const itemsTotal = useMemo(() => {
    return Object.entries(selected).reduce((acc, [_productId, data]) => {
      const unit = data.unitPrice ?? 0;
      const qty = data.quantity ?? 0;
      return acc + unit * qty;
    }, 0);
  }, [selected]);

  const discountAmount = useMemo(() => {
    const dv = Number(discountValue || 0);
    if (discountType === "percent") return (itemsTotal * dv) / 100;
    if (discountType === "fixed") return dv;
    return 0;
  }, [discountType, discountValue, itemsTotal]);

  const totalSelectedValue = useMemo(() => {
    return Math.max(0, itemsTotal - discountAmount);
  }, [itemsTotal, discountAmount]);

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

  return (
    <div className="space-y-4">
      <form id={id} action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            name="description"
            type="text"
            placeholder="Descrição da receita"
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.description?.[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <DatePicker
            id="date"
            name="date"
            required
            defaultValue={today}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.date?.[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Hora</Label>
          <Input
            id="time"
            name="time"
            type="time"
            defaultValue={currentTime}
            className="rounded-md"
            required
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.time?.[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Receita Total</Label>
          <CurrencyInput
            id="value"
            name="value"
            step="0.01"
            min={0}
            required
          />
          {errors.value && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.value[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
          <Input
            id="profitMargin"
            name="profitMargin"
            type="number"
            inputMode="numeric"
            step="0.01"
            min={0}
            max={100}
            defaultValue="28"
            required
          />
          {errors.profitMargin && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.profitMargin[0]}
            </p>
          )}
        </div>

        {products.length > 0 && (
          <div className="space-y-3">
            <Label>Itens vendidos (define preço unitário e aplica desconto opcional)</Label>
            <div className="grid grid-cols-1 gap-2">
              {products.map((p) => {
                const selectedData = selected[p.id] ?? { quantity: 0, unitPrice: Number(p.price) };
                const available = p.quantity;
                const canAdd = selectedData.quantity < available;
                return (
                  <div key={p.id} className={cn("flex items-center justify-between rounded-md border p-2", selectedData.quantity > 0 ? "bg-slate-50" : "")}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-slate-500">
                        Preço {formatCurrency(Number(p.price))} • Estoque - {available}
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
            <input type="hidden" name="soldItemsJson" value={JSON.stringify(Object.entries(selected).map(([id, data]) => ({ productId: Number(id), quantity: data.quantity, unitPrice: data.unitPrice })))} />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="discountType">Tipo de Desconto</Label>
                <select id="discountType" name="discountType" className="w-full rounded-md border p-2" value={discountType} onChange={(e) => setDiscountType(e.target.value as "" | "percent" | "fixed")}>
                  <option value="">Sem desconto</option>
                  <option value="percent">Percentual (%)</option>
                  <option value="fixed">Valor fixo</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="discountValue">Valor do Desconto</Label>
                <Input id="discountValue" name="discountValue" type="number" min={0} step="0.01" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerId">Cliente</Label>
              <div className="flex items-center gap-2">
                <select id="customerId" name="customerId" className="w-full rounded-md border p-2" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">Sem cliente</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">Novo</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                      <DialogTitle>Novo Cliente</DialogTitle>
                      <DialogDescription className="hidden" aria-hidden="true" />
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                      <Label htmlFor="newCustomerName">Nome</Label>
                      <Input id="newCustomerName" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} placeholder="Nome do cliente" />
                    </div>
                    <DialogFooter className="gap-2">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button
                        type="button"
                        onClick={async () => {
                          const name = newCustomerName.trim();
                          if (!name) return;
                          try {
                            const res = await fetch("/api/clientes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
                            if (!res.ok) return;
                            const created = (await res.json()) as { id: number; name: string };
                            setCustomers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
                            setCustomerId(String(created.id));
                            setNewCustomerName("");
                            setAddCustomerOpen(false);
                          } catch {}
                        }}
                      >Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="text-sm text-slate-600">Total dos itens selecionados: <span className="font-medium">{formatCurrency(totalSelectedValue)}</span></div>
          </div>
        )}

        {!id && (
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Adicionando..." : "Adicionar Receita"}
          </Button>
        )}

        {state.message && (
          <>
            {state.success === true ? (
              <p className="mt-2 text-sm text-green-600" aria-live="polite">
                {state.message}
              </p>
            ) : (
              <p className="mt-2 text-sm text-red-500" aria-live="polite">
                {state.message}
              </p>
            )}
          </>
        )}
      </form>
    </div>
  );
}