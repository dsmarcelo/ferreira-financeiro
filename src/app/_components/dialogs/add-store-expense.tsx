"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionCreateStoreExpense,
  type ActionResponse,
} from "@/actions/store-expense-actions";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";

// Initial state for the form
const initialState: ActionResponse = {
  success: false,
  message: "",
};

// Dialog component for adding a store expense
export default function AddStoreExpense({ className }: { className?: string }) {
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={cn("rounded-full", className)}>
          Adicionar Despesa da Loja
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Despesa da Loja</DialogTitle>
          <DialogDescription aria-hidden="true"></DialogDescription>
        </DialogHeader>
        <form
          key={isOpen ? "open" : "closed"}
          action={formAction}
          className="space-y-4"
        >
          <div>
            <label htmlFor="date">Data</label>
            <DatePicker id="date" name="date" required defaultValue={today} />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500" aria-live="polite">
                {errors.date[0]}
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
            <label htmlFor="description">Descrição</label>
            <Input type="text" id="description" name="description" required />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500" aria-live="polite">
                {errors.description[0]}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="dueDate">Vencimento (opcional)</label>
            <DatePicker id="dueDate" name="dueDate" />
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
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {pending ? "Adicionando..." : "Adicionar"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
