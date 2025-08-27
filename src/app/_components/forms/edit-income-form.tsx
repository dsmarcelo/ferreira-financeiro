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
  IncomeProductEditor,
} from "./income";

interface EditIncomeFormProps {
  id?: string;
  income: Income;
  items?: Array<{
    productId: number;
    quantity: number;
    unitPrice: string;
    name?: string | null;
  }>;
  onSuccess?: () => void;
  onClose?: () => void;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function EditIncomeForm({
  id,
  income,
  items = [],
  onSuccess,
  onClose,
}: EditIncomeFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateIncome,
    initialState,
  );

  // Load data helpers
  const { products, customers, createCustomer } = useIncomeData();

  // Hydration gate for selects
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Local form state (aligned with new Add flow)
  const [description, setDescription] = useState<string>(
    income.description ?? "",
  );
  const [dateStr, setDateStr] = useState<string>(
    income.dateTime
      ? new Date(income.dateTime).toLocaleDateString("en-CA", {
          timeZone: "America/Sao_Paulo",
        })
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
  const [profitMargin, setProfitMargin] = useState<number>(
    Number(income.profitMargin) || 0,
  );
  const [customerId, setCustomerId] = useState<string>(
    income.customerId ? String(income.customerId) : "",
  );

  // Discount state (UI uses "percentage" | "fixed"); DB uses "percent" | "fixed")
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    income.discountType === "fixed" ? "fixed" : "percentage",
  );
  const [discountValue, setDiscountValue] = useState<number | undefined>(
    income.discountValue ? Number(income.discountValue) : undefined,
  );

  // Editable selected products state (initialized from provided items)
  const [selectedProducts, setSelectedProducts] = useState<
    Record<number, { quantity: number; unitPrice: number }>
  >(() => {
    const map: Record<number, { quantity: number; unitPrice: number }> = {};
    for (const it of items) {
      const pid = Number(it.productId);
      if (!Number.isFinite(pid)) continue;
      const qty = Number(it.quantity) || 0;
      const price = Number(it.unitPrice) || 0;
      if (qty > 0) map[pid] = { quantity: qty, unitPrice: price };
    }
    return map;
  });

  // Hydrate items from server to ensure latest linkage when opening the form
  useEffect(() => {
    const incomeId = income.id;
    if (!incomeId) return;
    void (async () => {
      try {
        const res = await fetch(`/api/receitas/${incomeId}/itens`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as Array<{
          productId: number;
          quantity: number;
          unitPrice: string | number;
          name?: string | null;
        }>;
        if (!Array.isArray(data)) return;
        const map: Record<number, { quantity: number; unitPrice: number }> = {};
        for (const it of data) {
          const pid = Number(it.productId);
          if (!Number.isFinite(pid)) continue;
          const qty = Number(it.quantity) || 0;
          const price = Number(it.unitPrice) || 0;
          if (qty > 0) map[pid] = { quantity: qty, unitPrice: price };
        }
        setSelectedProducts((prev) => {
          // If user already modified, do not clobber; merge new keys, keep edited ones
          const next = { ...map, ...prev };
          return next;
        });
      } catch {
        // ignore
      }
    })();
  }, [income.id]);

  // Original quantities for this income to compute available stock in edit mode
  const originalQuantities = useMemo(() => {
    const map: Record<number, number> = {};
    for (const it of items) {
      const pid = Number(it.productId);
      if (!Number.isFinite(pid)) continue;
      const qty = Number(it.quantity) || 0;
      map[pid] = (map[pid] ?? 0) + qty;
    }
    return map;
  }, [items]);

  // Compute items total from editable selected products
  const itemsTotal = useMemo((): number => {
    return Object.entries(selectedProducts).reduce(
      (acc, [_productId, data]) => {
        const unit = data.unitPrice ?? 0;
        const qty = data.quantity ?? 0;
        return acc + unit * qty;
      },
      0,
    );
  }, [selectedProducts]);

  // Extra value is persisted in DB and must not change when products change
  const [extraValue, setExtraValue] = useState<number>(
    Number(income.extraValue) || 0,
  );

  // Now compute subtotal and discount amount based on current state
  const subtotal = useMemo((): number => {
    return itemsTotal + extraValue;
  }, [itemsTotal, extraValue]);

  const discountAmount = useMemo((): number => {
    if (!discountValue || discountValue <= 0) return 0;
    if (discountType === "percentage") return (subtotal * discountValue) / 100;
    return discountValue;
  }, [discountType, discountValue, subtotal]);

  // Totals
  const totalSelectedValue = useMemo(
    (): number => Math.max(0, subtotal - discountAmount),
    [subtotal, discountAmount],
  );
  const profitAmount = useMemo(
    (): number => extraValue * (profitMargin / 100),
    [extraValue, profitMargin],
  );
  const finalTotal = useMemo(
    (): number => totalSelectedValue,
    [totalSelectedValue],
  );

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

  // selectedProducts comes from local state above and is editable

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
            totalSelectedValue={totalSelectedValue}
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
          discountAmount={discountAmount}
        />

        {/* Editable products */}
        <IncomeProductEditor
          products={products}
          selectedProducts={selectedProducts}
          originalQuantities={originalQuantities}
          onChange={setSelectedProducts}
        />

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
          <div className="flex w-full justify-between gap-2 pt-2">
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
