"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionCreateStoreExpense,
  type ActionResponse,
} from "@/actions/store-expense-actions";
import ResponsiveDialog from "@/app/_components/responsive-dialog";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";
import { Label } from "@/components/ui/label";
import { IsPaidCheckbox } from "@/app/_components/inputs/is-paid-input";

// Initial state for the form
const initialState: ActionResponse = {
  success: false,
  message: "",
};

// Dialog component for adding a store expense
interface AddStoreExpenseProps {
  className?: string;
  children?: React.ReactNode;
}

export default function AddStoreExpense({
  className,
  children,
}: AddStoreExpenseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionCreateStoreExpense,
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
          <Button className={cn("rounded-full", className)}>
            Adicionar Despesa da Loja
          </Button>
        )
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Adicionar Despesa da Loja"
    >
      <form
        key={isOpen ? "open" : "closed"}
        action={formAction}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input type="text" id="description" name="description" required />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.description[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
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
        <div className="space-y-2">
          <Label htmlFor="dueDate">Vencimento</Label>
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
        <IsPaidCheckbox />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Adicionando..." : "Adicionar"}
        </Button>
        {/* General message area for non-field errors/messages */}
        {state.message && (
          <p className="mt-2 text-sm text-green-600" aria-live="polite">
            {state.message}
          </p>
        )}
      </form>
    </ResponsiveDialog>
  );
}
