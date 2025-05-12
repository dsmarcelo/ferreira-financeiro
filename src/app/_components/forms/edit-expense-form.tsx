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
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={expense.date ? expense.date.slice(0, 10) : ""}
          required
          aria-invalid={!!errors.date}
        />
        <FieldError messages={errors.date} />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium">
          Tipo
        </label>
        <select
          id="type"
          name="type"
          className="border-input bg-background block w-full rounded-md border px-3 py-2 text-sm shadow-sm"
          defaultValue={expense.type}
          required
          aria-invalid={!!errors.type}
        >
          <option value="one_time">Única</option>
          <option value="installment">Parcelada</option>
          <option value="recurring">Recorrente</option>
        </select>
        <FieldError messages={errors.type} />
      </div>
      <div>
        <label htmlFor="source" className="block text-sm font-medium">
          Origem
        </label>
        <select
          id="source"
          name="source"
          className="border-input bg-background block w-full rounded-md border px-3 py-2 text-sm shadow-sm"
          defaultValue={expense.source}
          required
          aria-invalid={!!errors.source}
        >
          <option value="personal">Pessoal</option>
          <option value="store">Loja</option>
          <option value="product_purchase">Compra de Produto</option>
        </select>
        <FieldError messages={errors.source} />
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
      {expense.type === "installment" && (
        <div className="flex gap-2">
          <div>
            <label
              htmlFor="installmentNumber"
              className="block text-sm font-medium"
            >
              Nº Parcela
            </label>
            <Input
              id="installmentNumber"
              name="installmentNumber"
              type="number"
              min={1}
              defaultValue={expense.installmentNumber ?? ""}
              aria-invalid={!!errors.installmentNumber}
            />
            <FieldError messages={errors.installmentNumber} />
          </div>
          <div>
            <label
              htmlFor="totalInstallments"
              className="block text-sm font-medium"
            >
              Total Parcelas
            </label>
            <Input
              id="totalInstallments"
              name="totalInstallments"
              type="number"
              min={1}
              defaultValue={expense.totalInstallments ?? ""}
              aria-invalid={!!errors.totalInstallments}
            />
            <FieldError messages={errors.totalInstallments} />
          </div>
        </div>
      )}
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
