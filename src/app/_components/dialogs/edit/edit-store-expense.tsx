"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionDeleteStoreExpense,
  actionUpdateStoreExpense,
  type ActionResponse,
} from "@/actions/store-expense-actions";
import ResponsiveDialog from "@/app/_components/responsive-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import type { StoreExpense } from "@/server/db/schema/store-expense";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "../delete-dialog";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";

interface EditStoreExpenseProps {
  data: StoreExpense;
  className?: string;
  children: React.ReactNode;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function EditStoreExpense({
  data,
  children,
}: EditStoreExpenseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateStoreExpense,
    initialState,
  );

  // Handle success/error toasts and dialog state
  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
      setIsOpen(false);
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  // Parse error messages from ActionResponse
  const errors = state?.errors ?? {};

  return (
    <ResponsiveDialog
      triggerButton={children}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Editar Despesa da Loja"
    >
      <form
        key={isOpen ? "open" : "closed"}
        action={formAction}
        className="space-y-4"
      >
        <input type="hidden" name="id" value={data.id} />
        <div className="space-y-2">
          <Label htmlFor="dueDate">Vencimento</Label>
          <DatePicker id="dueDate" name="dueDate" required defaultValue={data.dueDate} />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.dueDate[0]}
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
            initialValue={Number(data.value)}
          />
          {errors.value && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.value[0]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            type="text"
            id="description"
            name="description"
            required
            defaultValue={data.description}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.description[0]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Vencimento (opcional)</Label>
          <DatePicker
            id="dueDate"
            name="dueDate"
            defaultValue={data.dueDate ?? undefined}
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.dueDate[0]}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPaid"
            name="isPaid"
            defaultChecked={data.isPaid}
          />
          <Label htmlFor="isPaid">Pago</Label>
        </div>
        <div className="mt-8 flex gap-2">
          <DeleteDialog
            onConfirm={() => {
              void actionDeleteStoreExpense(data.id);
            }}
          />
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
        {state.message && (
          <p className="mt-2 text-sm text-red-600" aria-live="polite">
            {state.message}
          </p>
        )}
      </form>
    </ResponsiveDialog>
  );
}
