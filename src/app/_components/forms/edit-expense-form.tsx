"use client";

import { useActionState, useEffect } from "react";
import {
  actionUpdateExpense,
  type ActionResponse,
} from "@/actions/expense-actions";
import type { Expense } from "@/server/db/schema/expense";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldError } from "../forms/field-error";
import CurrencyInput from "@/components/inputs/currency-input";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";

// Cleaned up: removed unused/duplicate types and stray zod schema

const initialState: ActionResponse = {
  success: false,
  message: "",
};

type EditExpenseFormProps = {
  expense: Expense;
  onSuccess?: () => void;
};

export default function EditExpenseForm({
  expense,
  onSuccess,
}: EditExpenseFormProps) {
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateExpense,
    initialState,
  );

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      onSuccess?.();
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state, onSuccess]);

  const errors = state?.errors ?? {};

  return (
    <form className="space-y-4" action={formAction} aria-label="Editar Despesa">
      {/* Hidden fields required by the action */}
      <input type="hidden" name="id" value={expense.id} />
      <input type="hidden" name="type" value={expense.type} />
      <input type="hidden" name="source" value={expense.source} />
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descrição
        </label>
        <Input
          id="description"
          name="description"
          defaultValue={expense.description ?? ""}
          required
          aria-invalid={!!errors.description}
        />
        <FieldError messages={errors.description} />
      </div>

      <div>
        <label htmlFor="value" className="block text-sm font-medium">
          Valor
        </label>
        <CurrencyInput
          id="value"
          name="value"
          initialValue={Number(expense.value)}
          required
          aria-invalid={!!errors.value}
        />
        <FieldError messages={errors.value} />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium">
          Data
        </label>
        <DatePicker
          id="date"
          name="date"
          defaultValue={expense.date}
          required
          aria-invalid={!!errors.date}
        />
        <FieldError messages={errors.date} />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPaid"
          name="isPaid"
          defaultChecked={expense.isPaid}
          className="accent-primary border-input h-4 w-4 rounded border"
        />
        <label htmlFor="isPaid" className="text-sm font-medium">
          Pago
        </label>
      </div>
      <Button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="w-full"
      >
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
