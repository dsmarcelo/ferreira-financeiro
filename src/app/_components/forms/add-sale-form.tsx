"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { actionCreateSale, type ActionResponse } from "@/actions/sales-actions";
import { toast } from "sonner";
import { useIncomeFormStore } from "@/stores/income-form-store";
import { useIncomeData } from "@/hooks/use-income-data";
import {
  SalesBasicFields,
  SalesProductEditor,
  SalesCustomerSelector,
  SalesDiscountSection,
  SalesSummary,
  SalesFormActions,
} from "./sales";

interface AddSaleFormProps {
  id?: string;
  onSuccess?: () => void;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function AddSaleForm({ id, onSuccess }: AddSaleFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionCreateSale,
    initialState,
  );

  // Use Zustand store for form state
  const incomeForm = useIncomeFormStore();
  const clearFormData = useIncomeFormStore((s) => s.clearFormData);
  const { products, customers, createCustomer } = useIncomeData();

  // Wait for hydration to complete before rendering selects
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // Use a simple timeout to ensure hydration is complete
    const timer = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Prevent state updates during form submission to avoid infinite loops
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission to prevent infinite loops
  const handleFormSubmit = () => {
    setIsSubmitting(true);
  };

  // Handle success/error toasts and navigation
  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
      setIsSubmitting(false);

      if (onSuccess) {
        onSuccess();
      } else {
        router.back();
      }
    } else if (state.success === false && state.message) {
      toast.error(state.message);
      setIsSubmitting(false);
    }
  }, [state.success, state.message, onSuccess, router]);

  // Parse error messages from ActionResponse
  const errors = state?.errors ?? {};

  // Clear form state after successful submission
  useEffect(() => {
    if (state.success === true) {
      clearFormData();
    }
  }, [state.success, clearFormData]);

  // Calculations
  const itemsTotal = useMemo((): number => {
    return Object.entries(incomeForm.selectedProducts).reduce(
      (acc, [_productId, data]) => {
        const unit = data.unitPrice ?? 0;
        const qty = data.quantity ?? 0;
        return acc + unit * qty;
      },
      0,
    );
  }, [incomeForm.selectedProducts]);

  const subtotal = useMemo((): number => itemsTotal, [itemsTotal]);

  const discountAmount = useMemo((): number => {
    const dv = incomeForm.discountValue ?? 0;
    if (incomeForm.discountType === "percentage") return (subtotal * dv) / 100;
    if (incomeForm.discountType === "fixed") return dv;
    return 0;
  }, [incomeForm.discountType, incomeForm.discountValue, subtotal]);

  const totalSelectedValue = useMemo((): number => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const finalTotal = useMemo((): number => {
    // Total must NOT include profit. It is subtotal - discount.
    return totalSelectedValue;
  }, [totalSelectedValue]);

  return (
    <div className="w-full space-y-4">
      <form
        id={id}
        action={formAction}
        onSubmit={handleFormSubmit}
        className="space-y-4 text-base"
      >
        <SalesBasicFields
          description={incomeForm.description}
          dateStr={incomeForm.dateStr}
          timeStr={incomeForm.timeStr}
          onDescriptionChange={incomeForm.setDescription}
          onDateChange={incomeForm.setDateStr}
          onTimeChange={incomeForm.setTimeStr}
          errors={errors}
        />

        <SalesProductEditor
          products={products}
          selectedProducts={incomeForm.selectedProducts}
          onChange={incomeForm.setSelectedProducts}
        />

        {hydrated && (
          <SalesCustomerSelector
            customers={customers}
            customerId={incomeForm.customerId}
            onCustomerIdChange={incomeForm.setCustomerId}
            onCustomerCreate={createCustomer}
            disabled={isSubmitting}
          />
        )}

        {hydrated && (
          <SalesDiscountSection
            discountType={incomeForm.discountType}
            discountValue={incomeForm.discountValue}
            totalSelectedValue={totalSelectedValue}
            onDiscountTypeChange={incomeForm.setDiscountType}
            onDiscountValueChange={incomeForm.setDiscountValue}
            disabled={isSubmitting}
          />
        )}

        <SalesSummary
          totalSelectedValue={totalSelectedValue}
          finalTotal={finalTotal}
          discountAmount={discountAmount}
        />

        <SalesFormActions
          formId={id}
          pending={pending}
          selectedProducts={incomeForm.selectedProducts}
          finalTotal={finalTotal}
          customerId={incomeForm.customerId}
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
