"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { actionCreateSale, type ActionResponse } from "@/actions/sales-actions";
import { toast } from "sonner";
import { useSalesFormStore } from "@/stores/sales-form-store";
import { useSalesData } from "@/hooks/use-sales-data";
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
  const saleForm = useSalesFormStore();
  const clearFormData = useSalesFormStore((s) => s.clearFormData);
  const { products, customers, createCustomer } = useSalesData();

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
    return Object.entries(saleForm.selectedProducts).reduce(
      (acc, [_productId, data]) => {
        const unit = data.unitPrice ?? 0;
        const qty = data.quantity ?? 0;
        return acc + unit * qty;
      },
      0,
    );
  }, [saleForm.selectedProducts]);

  const subtotal = useMemo((): number => itemsTotal, [itemsTotal]);

  const discountAmount = useMemo((): number => {
    const dv = saleForm.discountValue ?? 0;
    if (saleForm.discountType === "percentage") return (subtotal * dv) / 100;
    if (saleForm.discountType === "fixed") return dv;
    return 0;
  }, [saleForm.discountType, saleForm.discountValue, subtotal]);

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
          description={saleForm.description}
          dateStr={saleForm.dateStr}
          timeStr={saleForm.timeStr}
          onDescriptionChange={saleForm.setDescription}
          onDateChange={saleForm.setDateStr}
          onTimeChange={saleForm.setTimeStr}
          errors={errors}
        />

        <SalesProductEditor
          products={products}
          selectedProducts={saleForm.selectedProducts}
          onChange={saleForm.setSelectedProducts}
        />

        {hydrated && (
          <SalesCustomerSelector
            customers={customers}
            customerId={saleForm.customerId}
            onCustomerIdChange={saleForm.setCustomerId}
            onCustomerCreate={createCustomer}
            disabled={isSubmitting}
          />
        )}

        {hydrated && (
          <SalesDiscountSection
            discountType={saleForm.discountType}
            discountValue={saleForm.discountValue}
            totalSelectedValue={totalSelectedValue}
            onDiscountTypeChange={saleForm.setDiscountType}
            onDiscountValueChange={saleForm.setDiscountValue}
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
          selectedProducts={saleForm.selectedProducts}
          finalTotal={finalTotal}
          customerId={saleForm.customerId}
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
