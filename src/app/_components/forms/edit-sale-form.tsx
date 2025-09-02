"use client";

// TODO: Refactor this to let the user edit the items

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  actionDeleteSale,
  actionUpdateSale,
  type ActionResponse,
} from "@/actions/sales-actions";
import type { Sale } from "@/server/db/schema/sales-schema";
import { toast } from "sonner";
import { useSalesData } from "@/hooks/use-sales-data";
import {
  SalesBasicFields,
  SalesCustomerSelector,
  SalesDiscountSection,
  SalesSummary,
  SalesFormActions,
  SalesProductEditor,
} from "./sales";

interface EditSaleFormProps {
  id?: string;
  sale: Sale;
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

export default function EditSaleForm({
  id,
  sale,
  items = [],
  onSuccess,
  onClose,
}: EditSaleFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateSale,
    initialState,
  );

  // Load data helpers
  const { products, customers, createCustomer } = useSalesData();

  // Hydration gate for selects
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Local form state (aligned with new Add flow)
  const [description, setDescription] = useState<string>(
    sale.description ?? "",
  );
  const [dateStr, setDateStr] = useState<string>(
    sale.dateTime
      ? new Date(sale.dateTime).toLocaleDateString("en-CA", {
          timeZone: "America/Sao_Paulo",
        })
      : "",
  );
  const [timeStr, setTimeStr] = useState<string>(
    sale.dateTime
      ? new Date(sale.dateTime).toLocaleTimeString("pt-BR", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        })
      : "12:00",
  );
  const [customerId, setCustomerId] = useState<string>(
    sale.customerId ? String(sale.customerId) : "",
  );

  // Discount state (UI uses "percentage" | "fixed"); DB uses "percent" | "fixed")
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    sale.discountType === "fixed" ? "fixed" : "percentage",
  );
  const [discountValue, setDiscountValue] = useState<number | undefined>(
    sale.discountValue ? Number(sale.discountValue) : undefined,
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
    const saleId = sale.id;
    if (!saleId) return;
    void (async () => {
      try {
        const res = await fetch(`/api/vendas/${saleId}/itens`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as Array<{
          productId: number;
          quantity: number;
          unitPrice: number;
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
  }, [sale.id]);

  // Original quantities for this sale to compute available stock in edit mode
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

  // Now compute subtotal and discount amount based on current state
  const subtotal = useMemo((): number => {
    return itemsTotal;
  }, [itemsTotal]);

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
    if (!sale.id) return;
    if (!window.confirm("Tem certeza que deseja excluir esta venda?")) return;

    try {
      await actionDeleteSale(sale.id);
      toast.success("Venda excluída com sucesso!");
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    } catch (error) {
      toast.error("Erro ao excluir venda");
      console.error("Error deleting sale:", error);
    }
  };

  // selectedProducts comes from local state above and is editable

  return (
    <div className="space-y-4">
      <form id={id} action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={sale.id} />

        {/* Unified basic fields */}
        <SalesBasicFields
          description={description}
          dateStr={dateStr}
          timeStr={timeStr}
          onDescriptionChange={setDescription}
          onDateChange={setDateStr}
          onTimeChange={setTimeStr}
          errors={errors}
        />

        {/* Customer selector */}
        {hydrated && (
          <SalesCustomerSelector
            customers={customers}
            customerId={customerId}
            onCustomerIdChange={setCustomerId}
            onCustomerCreate={createCustomer}
          />
        )}

        {/* Discount section */}
        {hydrated && (
          <SalesDiscountSection
            discountType={discountType}
            discountValue={discountValue}
            totalSelectedValue={totalSelectedValue}
            onDiscountTypeChange={setDiscountType}
            onDiscountValueChange={setDiscountValue}
          />
        )}

        {/* Summary */}
        <SalesSummary
          totalSelectedValue={totalSelectedValue}
          finalTotal={finalTotal}
          discountAmount={discountAmount}
        />

        {/* Editable products */}
        <SalesProductEditor
          products={products}
          selectedProducts={selectedProducts}
          originalQuantities={originalQuantities}
          onChange={setSelectedProducts}
        />

        {/* Hidden inputs for submission (mirrors Add form) */}
        <SalesFormActions
          formId={id}
          pending={pending}
          selectedProducts={selectedProducts}
          finalTotal={finalTotal}
          customerId={customerId}
          isEditMode={true}
          onDelete={handleDelete}
        />

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
