"use client";

import { useActionState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  actionCreateIncome,
  type ActionResponse,
} from "@/actions/income-actions";
import { toast } from "sonner";
import { useIncomeFormPersistence } from "@/hooks/use-income-form-persistence";
import { useIncomeData } from "@/hooks/use-income-data";
import {
  IncomeBasicFields,
  IncomeProductSelection,
  IncomeCustomerSelector,
  IncomeDiscountSection,
  IncomeSummary,
  IncomeFormActions,
} from "./income";

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

  // Use custom hooks for data management
  const formPersistence = useIncomeFormPersistence();
  const { products, customers, createCustomer, customersLoading } =
    useIncomeData();

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

  // Hydrate customer ID from localStorage once, after customers are loaded
  useEffect(() => {
    if (!customersLoading) {
      formPersistence.setCustomersLoaded(true);
      formPersistence.hydrateCustomerId(customers);
    }
  }, [customersLoading, customers, formPersistence]);

  // Clear persisted state after successful submission
  useEffect(() => {
    if (state.success === true) {
      formPersistence.clearPersistedData();
    }
  }, [state.success, formPersistence]);

  // Calculations
  const itemsTotal = useMemo(() => {
    return Object.entries(formPersistence.selectedProducts).reduce(
      (acc, [_productId, data]) => {
        const unit = data.unitPrice ?? 0;
        const qty = data.quantity ?? 0;
        return acc + unit * qty;
      },
      0,
    );
  }, [formPersistence.selectedProducts]);

  const discountAmount = useMemo(() => {
    const dv = formPersistence.discountValue ?? 0;
    if (formPersistence.discountType === "percentage")
      return (itemsTotal * dv) / 100;
    if (formPersistence.discountType === "fixed") return dv;
    return 0;
  }, [formPersistence.discountType, formPersistence.discountValue, itemsTotal]);

  const totalSelectedValue = useMemo(() => {
    return Math.max(0, itemsTotal - discountAmount);
  }, [itemsTotal, discountAmount]);

  const profitAmount = useMemo(() => {
    return formPersistence.extraValue * (formPersistence.profitMargin / 100);
  }, [formPersistence.extraValue, formPersistence.profitMargin]);

  const finalTotal = useMemo(() => {
    // Total must NOT include profit. It is products total + extra value only.
    return totalSelectedValue + formPersistence.extraValue;
  }, [totalSelectedValue, formPersistence.extraValue]);

  return (
    <div className="w-full space-y-4">
      <form id={id} action={formAction} className="space-y-4 text-base">
        <IncomeBasicFields
          description={formPersistence.description}
          dateStr={formPersistence.dateStr}
          timeStr={formPersistence.timeStr}
          extraValue={formPersistence.extraValue}
          profitMargin={formPersistence.profitMargin}
          onDescriptionChange={formPersistence.setDescription}
          onDateChange={formPersistence.setDateStr}
          onTimeChange={formPersistence.setTimeStr}
          onExtraValueChange={formPersistence.setExtraValue}
          onProfitMarginChange={formPersistence.setProfitMargin}
          errors={errors}
        />

        <IncomeProductSelection
          products={products}
          selectedProducts={formPersistence.selectedProducts}
        />

        <IncomeCustomerSelector
          customers={customers}
          customerId={formPersistence.customerId}
          onCustomerIdChange={formPersistence.setCustomerId}
          onCustomerCreate={createCustomer}
        />

        <IncomeDiscountSection
          discountType={formPersistence.discountType}
          discountValue={formPersistence.discountValue}
          totalSelectedValue={totalSelectedValue}
          onDiscountTypeChange={formPersistence.setDiscountType}
          onDiscountValueChange={formPersistence.setDiscountValue}
        />

        <IncomeSummary
          totalSelectedValue={totalSelectedValue}
          extraValue={formPersistence.extraValue}
          profitAmount={profitAmount}
          finalTotal={finalTotal}
          profitMargin={formPersistence.profitMargin}
        />

        <IncomeFormActions
          formId={id}
          pending={pending}
          selectedProducts={formPersistence.selectedProducts}
          finalTotal={finalTotal}
          extraValue={formPersistence.extraValue}
          customerId={formPersistence.customerId}
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
