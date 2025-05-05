"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionCreatePersonalExpense,
  type ActionResponse,
} from "@/actions/personal-expense-actions";
import ResponsiveDialog from "@/app/_components/responsive-dialog";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";

// Initial state for the form
const initialState: ActionResponse = {
  success: false,
  message: "",
};

// Dialog component for adding a personal expense
interface AddPersonalExpenseProps {
  children?: React.ReactNode;
}

export default function AddPersonalExpense({
  children,
}: AddPersonalExpenseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionCreatePersonalExpense,
    initialState,
  );

  // Handle success/error toasts and dialog state
  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  // Parse error messages from ActionResponse
  const errors = state?.errors ?? {};

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <ResponsiveDialog
      triggerButton={
        children ?? (
          <Button className="rounded-full">Adicionar Despesa Pessoal</Button>
        )
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Adicionar Despesa Pessoal"
    >
      <form
        key={isOpen ? "open" : "closed"}
        action={formAction}
        className="space-y-4"
      >
        <div>
          <label htmlFor="description">Descrição</label>
          <Input
            type="text"
            id="description"
            name="description"
            required
            autoFocus
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.description[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="amount">Valor</label>
          <CurrencyInput
            id="amount"
            name="amount"
            step="0.01"
            min={0}
            required
          />
          {errors.value && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.value[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="dueDate">Data</label>
          <DatePicker
            id="dueDate"
            name="dueDate"
            required
            defaultValue={today}
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.dueDate[0]}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isPaid" name="isPaid" />
          <label htmlFor="isPaid">Pago</label>
        </div>
        <p className="text-sm text-gray-500">
          {state.success ? "Despesa adicionada com sucesso!" : ""}
        </p>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Adicionando..." : "Adicionar"}
        </Button>
      </form>
    </ResponsiveDialog>
  );
}
