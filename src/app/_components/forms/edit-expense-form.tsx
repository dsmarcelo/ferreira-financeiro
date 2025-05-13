"use client";

import { useActionState, useEffect } from "react";
import {
  actionUpdateExpense,
  type ActionResponse,
} from "@/actions/expense-actions";
import type { Expense } from "@/server/db/schema/expense-schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldError } from "../forms/field-error";
import CurrencyInput from "@/components/inputs/currency-input";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";
import { useRouter } from "next/navigation";

// Cleaned up: removed unused/duplicate types and stray zod schema

const initialState: ActionResponse = {
  success: false,
  message: "",
};

type EditExpenseFormProps = {
  expense: Expense;
  onSuccess?: () => void;
};

import { actionDeleteExpense } from "@/actions/expense-actions";

export default function EditExpenseForm({
  expense,
  onSuccess,
}: EditExpenseFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateExpense,
    initialState,
  );

  const backUrl =
    expense.source === "product_purchase"
      ? "/compras-produtos"
      : "/despesas-pessoais";

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      onSuccess?.();
      router.push(backUrl);
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state, onSuccess, backUrl, router]);

  const [deleteState, deleteAction, deletePending] = useActionState<
    ActionResponse,
    FormData
  >(actionDeleteExpense, initialState);

  useEffect(() => {
    if (deleteState.success && deleteState.message) {
      toast.success(deleteState.message);
      router.push(backUrl);
    } else if (deleteState.success === false && deleteState.message) {
      toast.error(deleteState.message);
    }
  }, [deleteState, backUrl, router]);

  const errors = state?.errors ?? {};

  return (
    <>
      <form
        className="space-y-4"
        action={formAction}
        aria-label="Editar Despesa"
      >
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
      </form>
      <div className="mt-6 flex justify-end">
        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (!window.confirm("Tem certeza que deseja excluir esta despesa?"))
              e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={expense.id} />
          <Button type="submit" variant="destructive" disabled={deletePending}>
            {deletePending ? "Excluindo..." : "Excluir"}
          </Button>
        </form>
      </div>
    </>
  );
}
