"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { actionCreateIncome, type ActionResponse } from "@/actions/income-actions";
import { toast } from "sonner";
import { useIncomeFormStore } from "@/stores/income-form-store";
import { useIncomeData } from "@/hooks/use-income-data";
import { IncomeBasicFields } from "./income/income-basic-fields";
import { SalesCustomerSelector, SalesDiscountSection, SalesSummary, SalesFormActions } from "./sales";
import { IncomeFormActions } from "./income/income-form-actions";

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

  const form = useIncomeFormStore();
  const clearFormData = useIncomeFormStore((s) => s.clearFormData);
  const { customers, createCustomer } = useIncomeData();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
      if (onSuccess) onSuccess();
      else router.back();
      clearFormData();
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state.success, state.message, onSuccess, router, clearFormData]);

  const errors = state?.errors ?? {};

  // Local numeric state for total value and profit margin
  const [totalValue, setTotalValue] = useState<number | undefined>(undefined);
  const [profitMargin, setProfitMargin] = useState<number | undefined>(undefined);

  // Compute discount amount and final total based on entered totalValue (no items editor for incomes)
  const subtotal = totalValue ?? 0;
  const discountAmount = (() => {
    const dv = form.discountValue ?? 0;
    if (form.discountType === "percentage") return (subtotal * dv) / 100;
    if (form.discountType === "fixed") return dv;
    return 0;
  })();
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="w-full space-y-4">
      <form id={id} action={formAction} className="space-y-4 text-base">
        <IncomeBasicFields
          description={form.description}
          dateStr={form.dateStr}
          timeStr={form.timeStr}
          totalValue={totalValue}
          profitMargin={profitMargin}
          onDescriptionChange={form.setDescription}
          onDateChange={form.setDateStr}
          onTimeChange={form.setTimeStr}
          onTotalValueChange={setTotalValue}
          onProfitMarginChange={setProfitMargin}
          errors={errors}
        />

        {hydrated && (
          <SalesCustomerSelector
            customers={customers}
            customerId={form.customerId}
            onCustomerIdChange={form.setCustomerId}
            onCustomerCreate={createCustomer}
            disabled={pending}
          />
        )}

        {hydrated && (
          <SalesDiscountSection
            discountType={form.discountType}
            discountValue={form.discountValue}
            totalSelectedValue={Math.max(0, subtotal - discountAmount)}
            onDiscountTypeChange={form.setDiscountType}
            onDiscountValueChange={form.setDiscountValue}
            disabled={pending}
          />
        )}

        <SalesSummary
          totalSelectedValue={subtotal}
          finalTotal={finalTotal}
          discountAmount={discountAmount}
        />

        {/* Hidden inputs expected by server action */}
        <input type="hidden" name="totalValue" value={finalTotal} />
        <input type="hidden" name="customerId" value={form.customerId} />
        <input type="hidden" name="profitMargin" value={profitMargin ?? 0} />

        <IncomeFormActions formId={id} pending={pending} />

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


