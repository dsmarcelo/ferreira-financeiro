"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  actionCreateIncome,
  type ActionResponse,
} from "@/actions/income-actions";
import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";
import DiscountSelect, {
  type DiscountType,
} from "@/app/_components/inputs/discount-select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [products, setProducts] = useState<
    Array<{ id: number; name: string; price: string; quantity: number }>
  >([]);
  const [selected, setSelected] = useState<
    Record<number, { quantity: number; unitPrice: number }>
  >({});
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<number | undefined>(
    undefined,
  );
  const [customers, setCustomers] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [extraValue, setExtraValue] = useState<number>(0);
  const [profitMargin, setProfitMargin] = useState<number>(28);
  const [dateStr, setDateStr] = useState<string>("");
  const [timeStr, setTimeStr] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [customersLoaded, setCustomersLoaded] = useState(false);

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
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });

  const currentTime = new Date().toLocaleTimeString("pt-BR", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  // Load persisted form state from localStorage (and set sensible defaults)
  useEffect(() => {
    try {
      const savedDescription = localStorage.getItem("income-form-description");
      const savedDate = localStorage.getItem("income-form-date");
      const savedTime = localStorage.getItem("income-form-time");
      const savedExtra = localStorage.getItem("income-form-extraValue");
      const savedProfit = localStorage.getItem("income-form-profitMargin");
      const savedDiscountType = localStorage.getItem(
        "income-form-discountType",
      );
      const savedDiscountValue = localStorage.getItem(
        "income-form-discountValue",
      );

      if (savedDescription !== null) setDescription(savedDescription);
      // Defaults to today/current time if nothing saved
      setDateStr(savedDate ?? today);
      setTimeStr(savedTime ?? currentTime);
      if (savedExtra !== null) setExtraValue(Number(savedExtra) || 0);
      if (savedProfit !== null) setProfitMargin(Number(savedProfit) || 0);
      // Load discount type and map legacy value "percent" to "percentage"
      if (savedDiscountType === "fixed") {
        setDiscountType("fixed");
      } else if (savedDiscountType === "percent") {
        setDiscountType("percentage");
      } else if (savedDiscountType === "percentage") {
        setDiscountType("percentage");
      }
      // If savedDiscountType is null/undefined, keep the default "percentage"
      if (savedDiscountValue !== null)
        setDiscountValue(
          savedDiscountValue === "" ? undefined : Number(savedDiscountValue),
        );

      // Load previously selected products for summary and submission
      const savedSelection = localStorage.getItem("income-selected-products");
      if (savedSelection) {
        try {
          const parsed = JSON.parse(savedSelection) as unknown;
          if (parsed && typeof parsed === "object") {
            const validSelection: Record<
              number,
              { quantity: number; unitPrice: number }
            > = {};
            for (const [key, value] of Object.entries(
              parsed as Record<string, unknown>,
            )) {
              const productId = Number(key);
              if (
                Number.isFinite(productId) &&
                value &&
                typeof value === "object"
              ) {
                const obj = value as Record<string, unknown>;
                const quantity =
                  typeof obj.quantity === "number" ? obj.quantity : 0;
                const unitPrice =
                  typeof obj.unitPrice === "number" ? obj.unitPrice : 0;
                if (quantity > 0)
                  validSelection[productId] = { quantity, unitPrice };
              }
            }
            setSelected(validSelection);
          }
        } catch {}
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist form state to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem("income-form-description", description);
    } catch {}
  }, [description]);
  useEffect(() => {
    try {
      localStorage.setItem("income-form-date", dateStr);
    } catch {}
  }, [dateStr]);
  useEffect(() => {
    try {
      localStorage.setItem("income-form-time", timeStr);
    } catch {}
  }, [timeStr]);
  useEffect(() => {
    try {
      localStorage.setItem("income-form-extraValue", String(extraValue));
    } catch {}
  }, [extraValue]);
  useEffect(() => {
    try {
      localStorage.setItem("income-form-profitMargin", String(profitMargin));
    } catch {}
  }, [profitMargin]);
  useEffect(() => {
    try {
      localStorage.setItem("income-form-discountType", discountType);
    } catch {}
  }, [discountType]);
  useEffect(() => {
    try {
      if (discountValue === undefined)
        localStorage.removeItem("income-form-discountValue");
      else
        localStorage.setItem(
          "income-form-discountValue",
          String(discountValue),
        );
    } catch {}
  }, [discountValue]);
  useEffect(() => {
    if (customersLoaded) {
      try {
        if (customerId) {
          localStorage.setItem("income-form-customerId", customerId);
        } else {
          localStorage.removeItem("income-form-customerId");
        }
      } catch {}
    }
  }, [customerId, customersLoaded]);

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
              else if (typeof obj.price === "number")
                price = obj.price.toFixed(2);
              const quantity =
                typeof obj.quantity === "number"
                  ? obj.quantity
                  : Number(obj.quantity ?? 0);
              return { id, name, price, quantity };
            })
            .filter(
              (p) =>
                Number.isFinite(p.id) &&
                p.name.length > 0 &&
                Number.isFinite(p.quantity),
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
        if (Array.isArray(list)) {
          setCustomers(list);
          setCustomersLoaded(true);
        }
      } catch {
        setCustomersLoaded(true); // Still mark as loaded even on error
      }
    })();
  }, []);

  // Set customer ID from localStorage only after customers are loaded
  useEffect(() => {
    if (customersLoaded) {
      try {
        const savedCustomerId = localStorage.getItem("income-form-customerId");
        if (savedCustomerId !== null) {
          setCustomerId(savedCustomerId);
        }
      } catch {}
    }
  }, [customersLoaded]);

  const itemsTotal = useMemo(() => {
    return Object.entries(selected).reduce((acc, [_productId, data]) => {
      const unit = data.unitPrice ?? 0;
      const qty = data.quantity ?? 0;
      return acc + unit * qty;
    }, 0);
  }, [selected]);

  const discountAmount = useMemo(() => {
    const dv = discountValue ?? 0;
    if (discountType === "percentage") return (itemsTotal * dv) / 100;
    if (discountType === "fixed") return dv;
    return 0;
  }, [discountType, discountValue, itemsTotal]);

  const totalSelectedValue = useMemo(() => {
    return Math.max(0, itemsTotal - discountAmount);
  }, [itemsTotal, discountAmount]);

  const profitAmount = useMemo(() => {
    return extraValue * (profitMargin / 100);
  }, [extraValue, profitMargin]);

  const finalTotal = useMemo(() => {
    // Total must NOT include profit. It is products total + extra value only.
    return totalSelectedValue + extraValue;
  }, [totalSelectedValue, extraValue]);

  // Clear persisted state after successful submission
  useEffect(() => {
    if (state.success === true) {
      try {
        localStorage.removeItem("income-form-description");
        localStorage.removeItem("income-form-date");
        localStorage.removeItem("income-form-time");
        localStorage.removeItem("income-form-extraValue");
        localStorage.removeItem("income-form-profitMargin");
        localStorage.removeItem("income-form-discountType");
        localStorage.removeItem("income-form-discountValue");
        localStorage.removeItem("income-form-customerId");
        localStorage.removeItem("income-selected-products");
      } catch {}
    }
  }, [state.success]);

  return (
    <div className="w-full space-y-4">
      <form id={id} action={formAction} className="space-y-4 text-base">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            name="description"
            type="text"
            placeholder="Descrição da receita"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.description?.[0]}
            </p>
          )}
        </div>

        <div className="flex w-full items-center gap-2">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <DatePicker
              id="date"
              name="date"
              required
              defaultValue={today}
              value={dateStr}
              onChange={(d) => setDateStr(d ?? "")}
              className="w-fit"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500" aria-live="polite">
                {errors.date?.[0]}
              </p>
            )}
          </div>

          <div className="w-full space-y-2">
            <Label htmlFor="time">Hora</Label>
            <input
              id="time"
              name="time"
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="border-input h-9 w-fit rounded-md border px-2 py-0 shadow-xs"
              required
            />
            {errors.time && (
              <p className="mt-1 text-sm text-red-500" aria-live="polite">
                {errors.time?.[0]}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Valor Extra</Label>
          <CurrencyInput
            id="value"
            name="value"
            step="0.01"
            min={0}
            value={extraValue}
            onValueChange={(value) => setExtraValue(value ?? 0)}
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
            value={profitMargin}
            onChange={(e) => setProfitMargin(Number(e.target.value) || 0)}
            required
          />
          {errors.profitMargin && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.profitMargin[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Produtos</Label>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/caixa/adicionar/produtos")}
            >
              {Object.keys(selected).length > 0
                ? "Editar Produtos"
                : "Adicionar Produtos"}
            </Button>
          </div>

          {Object.keys(selected).length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {products
                .filter((p) => selected[p.id] && selected[p.id]!.quantity > 0)
                .map((p) => {
                  const selectedData = selected[p.id];
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
                          Preço {formatCurrency(Number(selectedData.unitPrice))}{" "}
                          • Em estoque: {available}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerId">Cliente</Label>
          <Select
            value={customerId}
            onValueChange={(val) => {
              if (val === "__new__") {
                setAddCustomerOpen(true);
                return;
              }
              setCustomerId(val);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__new__">Novo Cliente</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <DiscountSelect
            name="discount"
            discountType={discountType}
            onDiscountTypeChange={(type) => setDiscountType(type)}
            value={discountValue}
            onValueChange={setDiscountValue}
            placeholder="0"
            label="Desconto"
            showLabel={true}
          />
          {/* Customer selector moved outside; dialog remains here for reuse */}
          <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Novo Cliente</DialogTitle>
                <DialogDescription className="hidden" aria-hidden="true" />
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="newCustomerName">Nome</Label>
                <Input
                  id="newCustomerName"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  onClick={async () => {
                    const name = newCustomerName.trim();
                    if (!name) return;
                    try {
                      const res = await fetch("/api/clientes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name }),
                      });
                      if (!res.ok) return;
                      const created = (await res.json()) as {
                        id: number;
                        name: string;
                      };
                      setCustomers((prev) =>
                        [...prev, created].sort((a, b) =>
                          a.name.localeCompare(b.name),
                        ),
                      );
                      setCustomerId(String(created.id));
                      setNewCustomerName("");
                      setAddCustomerOpen(false);
                    } catch {}
                  }}
                >
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="text-sm text-slate-600">
            Total:{" "}
            <span className="font-medium">
              {formatCurrency(totalSelectedValue)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-sm text-slate-600">
            Produtos selecionados:{" "}
            <span className="font-medium">
              {formatCurrency(totalSelectedValue)}
            </span>
          </div>
          <div className="text-sm text-slate-600">
            Valor extra:{" "}
            <span className="font-medium">{formatCurrency(extraValue)}</span>
          </div>
          <div className="text-sm text-slate-600">
            Lucro sobre extra ({profitMargin}%):{" "}
            <span className="font-medium">{formatCurrency(profitAmount)}</span>
          </div>
          <div className="text-base font-medium text-slate-800">
            Total da Venda:{" "}
            <span className="font-bold">{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        {/* Hidden inputs for form data */}
        <input
          type="hidden"
          name="soldItemsJson"
          value={JSON.stringify(
            Object.entries(selected).map(([id, data]) => ({
              productId: Number(id),
              quantity: data.quantity,
              unitPrice: data.unitPrice,
            })),
          )}
        />
        <input type="hidden" name="totalValue" value={finalTotal} />
        <input type="hidden" name="extraValue" value={extraValue} />
        <input type="hidden" name="customerId" value={customerId} />
        {/* Discount data will be handled by DiscountSelect component's hidden inputs */}

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
