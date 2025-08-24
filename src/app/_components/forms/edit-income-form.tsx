"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  actionDeleteIncome,
  actionUpdateIncome,
  type ActionResponse,
} from "@/actions/income-actions";
import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";
import type { Income } from "@/server/db/schema/incomes-schema";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";
import { TrashIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DeleteDialog } from "../dialogs/delete-dialog";
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

interface EditIncomeFormProps {
  id?: string;
  income: Income;
  items?: Array<{ productId: number; quantity: number; unitPrice: string; name?: string | null }>;
  onSuccess?: () => void;
  onClose?: () => void;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function EditIncomeForm({ id, income, items = [], onSuccess, onClose }: EditIncomeFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateIncome,
    initialState,
  );

  const [customers, setCustomers] = useState<Array<{ id: number; name: string }>>([]);
  const [customerId, setCustomerId] = useState<string>(income.customerId ? String(income.customerId) : "");
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");

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

  const handleDelete = async () => {
    if (!income.id) return;
    if (!window.confirm("Tem certeza que deseja excluir esta receita?")) return;

    try {
      await actionDeleteIncome(income.id);
      toast.success("Receita excluída com sucesso!");
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    } catch (error) {
      toast.error("Erro ao excluir receita");
      console.error("Error deleting income:", error);
    }
  };

  return (
    <div className="space-y-4">
      <form id={id} action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={income.id} />

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            name="description"
            type="text"
            placeholder="Descrição da receita"
            defaultValue={income.description || ""}
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
            defaultValue={
              income.dateTime
                ? new Date(income.dateTime).toLocaleDateString('en-CA', {
                    timeZone: 'America/Sao_Paulo'
                  })
                : ""
            }
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
            defaultValue={
              income.dateTime
                ? new Date(income.dateTime).toLocaleTimeString('pt-BR', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo'
                  })
                : "12:00"
            }
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
          <Label htmlFor="value">Valor</Label>
          <CurrencyInput
            id="value"
            name="value"
            step="0.01"
            min={0}
            required
            initialValue={Number(income.value)}
          />
          {errors.value && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.value[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountType">Tipo de Desconto</Label>
          <Select
            defaultValue={income.discountType ?? ""}
            onValueChange={(val) => {
              const selectEl = document.getElementById("discountType");
              if (selectEl) (selectEl as HTMLInputElement).value = val;
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sem desconto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sem desconto</SelectItem>
              <SelectItem value="percent">Percentual (%)</SelectItem>
              <SelectItem value="fixed">Valor fixo</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" id="discountType" name="discountType" defaultValue={income.discountType ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountValue">Valor do Desconto</Label>
          <Input id="discountValue" name="discountValue" type="number" min={0} step="0.01" defaultValue={income.discountValue ? Number(income.discountValue) : 0} />
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
            defaultValue={Number(income.profitMargin)}
            required
          />
          {errors.profitMargin && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.profitMargin[0]}
            </p>
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
              <SelectItem value="">Sem cliente</SelectItem>
              <SelectItem value="__new__">Novo Cliente</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <input type="hidden" name="customerId" value={customerId} />

        {/* Sold items summary (read-only) */}
        {items.length > 0 && (
          <div className="space-y-2">
            <Label>Produtos vendidos</Label>
            <div className="grid grid-cols-1 gap-2">
              {items.map((it, idx) => (
                <div key={`${it.productId}-${idx}`} className="flex items-center justify-between rounded-md border p-1 px-3 bg-slate-50">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <p className="font-medium">
                        {it.quantity} x {it.name ?? `#${it.productId}`}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      Preço {Number(it.unitPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New customer dialog */}
        <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
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

        {!id && (
          <div className="w-full flex justify-between gap-2 pt-2">
            <DeleteDialog
              onConfirm={handleDelete}
              triggerText={<TrashIcon className="h-4 w-4 text-red-500" />}
            />

            <Button type="submit" disabled={pending} className="">
              {pending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
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