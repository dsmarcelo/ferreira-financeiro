"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionDeletePersonalExpense,
  actionUpdatePersonalExpense,
  type ActionResponse,
} from "@/actions/personal-expense-actions";
import ResponsiveDialog from "@/app/_components/responsive-dialog";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import type { PersonalExpense } from "@/server/db/schema/personal-expense";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "../delete-dialog";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";
import { Label } from "@/components/ui/label";
import { IsPaidCheckbox } from "@/app/_components/inputs/is-paid-input";

interface EditPersonalExpenseProps {
  data: PersonalExpense;
  className?: string;
  children?: React.ReactNode;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function EditPersonalExpense({
  data,
  children,
}: EditPersonalExpenseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdatePersonalExpense,
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

  const dialogProps = children
    ? { triggerButton: children }
    : {
        triggerButton: (
          <Button
            className="rounded-full"
            onClick={isOpen !== undefined ? () => setIsOpen(true) : undefined}
          >
            Editar Despesa Pessoal
          </Button>
        ),
      };

  return (
    <ResponsiveDialog
      {...dialogProps}
      {...(isOpen !== undefined ? { isOpen, onOpenChange: setIsOpen } : {})}
    >
      <form action={formAction} className="space-y-4">
        {/* Descrição */}
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

        {/* Valor */}
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

        <input type="hidden" name="id" value={data.id} />
        {/* Data */}
        <div className="space-y-2">
          <Label htmlFor="dueDate">Data</Label>
          <DatePicker
            id="dueDate"
            name="dueDate"
            required
            defaultValue={data.dueDate}
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.dueDate[0]}
            </p>
          )}
        </div>

        {/* Pago */}
        <IsPaidCheckbox isPaid={data.isPaid} />

        <div className="mt-8 flex gap-2">
          <DeleteDialog
            onConfirm={() => {
              void actionDeletePersonalExpense(data.id);
            }}
          />
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
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
