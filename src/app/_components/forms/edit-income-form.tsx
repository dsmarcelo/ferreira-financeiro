"use client";

// TODO: Refactor this to let the user edit the items

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  actionDeleteIncome,
  actionUpdateIncome,
  type ActionResponse,
} from "@/actions/income-actions";
import type { Income } from "@/server/db/schema/incomes-schema";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TrashIcon } from "lucide-react";
import { DeleteDialog } from "../dialogs/delete-dialog";
import { Label } from "@/components/ui/label";
import { useIncomeData } from "@/hooks/use-income-data";
import {
  IncomeBasicFields,
  IncomeCustomerSelector,
  IncomeDiscountSection,
  IncomeSummary,
  IncomeFormActions,
} from "./income";

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

  // Load data helpers
  const { customers, createCustomer } = useIncomeData();

  // Hydration gate for selects
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Local form state (aligned with new Add flow)
  const [description, setDescription] = useState<string>(income.description ?? "");
  const [dateStr, setDateStr] = useState<string>(
    income.dateTime
      ? new Date(income.dateTime).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" })
      : "",
  );
  const [timeStr, setTimeStr] = useState<string>(
    income.dateTime
      ? new Date(income.dateTime).toLocaleTimeString("pt-BR", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        })
      : "12:00",
  );
  const [profitMargin, setProfitMargin] = useState<number>(Number(income.profitMargin) || 0);
  const [customerId, setCustomerId] = useState<string>(income.customerId ? String(income.customerId) : "");

  // Discount state (UI uses "percentage" | "fixed"); DB uses "percent" | "fixed")
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    income.discountType === "fixed" ? "fixed" : "percentage",
  );
  const [discountValue, setDiscountValue] = useState<number | undefined>(
    income.discountValue ? Number(income.discountValue) : undefined,
  );

  // Compute items total from provided items
  const itemsTotal = useMemo(() => {
    return items.reduce((acc, it) => acc + Number(it.unitPrice) * Number(it.quantity), 0);
  }, [items]);

  // Compute discount amount from current state
  const discountAmount = useMemo(() => {
    if (!discountValue || discountValue <= 0) return 0;
    if (discountType === "percentage") return (itemsTotal * discountValue) / 100;
    return discountValue;
  }, [discountType, discountValue, itemsTotal]);

  // Derive initial extraValue from DB (value = itemsTotal - discount + extraValue)
  const computedInitialExtra = useMemo(() => {
    const baseAfterDiscount = Math.max(0, itemsTotal - discountAmount);
    const dbValue = Number(income.value);
    const extra = dbValue - baseAfterDiscount;
    return Math.max(0, Number.isFinite(extra) ? extra : 0);
  }, [income.value, itemsTotal, discountAmount]);

  const [extraValue, setExtraValue] = useState<number>(computedInitialExtra);
  useEffect(() => {
    // If discount or items change externally, recompute suggested extra only when it looks out of sync
    // Do not force if user has already changed extraValue manually
    setExtraValue((prev) => {
      // If the previous value matches the old computed value, update to the new computed value
      // Otherwise, respect user's manual override
      return prev === computedInitialExtra ? computedInitialExtra : prev;
    });
  }, [computedInitialExtra]);

  // Totals
  const totalSelectedValue = useMemo(() => Math.max(0, itemsTotal - discountAmount), [itemsTotal, discountAmount]);
  const profitAmount = useMemo(() => extraValue * (profitMargin / 100), [extraValue, profitMargin]);
  const finalTotal = useMemo(() => totalSelectedValue + extraValue, [totalSelectedValue, extraValue]);

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
  }, [state.success, state.message, onSuccess, router]);

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

  // Build selectedProducts map for hidden inputs in IncomeFormActions
  const selectedProducts = useMemo(() => {
    const map: Record<number, { quantity: number; unitPrice: number }> = {};
    for (const it of items) {
      const pid = Number(it.productId);
      if (!Number.isFinite(pid)) continue;
      const qty = Number(it.quantity) || 0;
      const price = Number(it.unitPrice) || 0;
      if (qty > 0) map[pid] = { quantity: qty, unitPrice: price };
    }
    return map;
  }, [items]);

  return (
    <div className="space-y-4">
      <form id={id} action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={income.id} />

        {/* Unified basic fields */}
        <IncomeBasicFields
          description={description}
          dateStr={dateStr}
          timeStr={timeStr}
          extraValue={extraValue}
          profitMargin={profitMargin}
          onDescriptionChange={setDescription}
          onDateChange={setDateStr}
          onTimeChange={setTimeStr}
          onExtraValueChange={setExtraValue}
          onProfitMarginChange={setProfitMargin}
          errors={errors}
        />

        {/* Customer selector */}
        {hydrated && (
          <IncomeCustomerSelector
            customers={customers}
            customerId={customerId}
            onCustomerIdChange={setCustomerId}
            onCustomerCreate={createCustomer}
          />
        )}

        {/* Discount section */}
        {hydrated && (
          <IncomeDiscountSection
            discountType={discountType}
            discountValue={discountValue}
            totalSelectedValue={Math.max(0, itemsTotal - (discountType === "percentage" ? ((itemsTotal * (discountValue ?? 0)) / 100) : (discountValue ?? 0)))}
            onDiscountTypeChange={setDiscountType}
            onDiscountValueChange={setDiscountValue}
          />
        )}

        {/* Summary */}
        <IncomeSummary
          totalSelectedValue={totalSelectedValue}
          extraValue={extraValue}
          profitAmount={profitAmount}
          finalTotal={finalTotal}
          profitMargin={profitMargin}
        />

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

        {/* Hidden inputs for submission (mirrors Add form) */}
        <IncomeFormActions
          formId={id}
          pending={pending}
          selectedProducts={selectedProducts}
          finalTotal={finalTotal}
          extraValue={extraValue}
          customerId={customerId}
        />

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