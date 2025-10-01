"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { actionCreateIncome, type ActionResponse } from "@/actions/income-actions";
import { toast } from "sonner";
import { useIncomeFormStore } from "@/stores/income-form-store";
import { IncomeBasicFields } from "./income/income-basic-fields";
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


