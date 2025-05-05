"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionDeleteCashRegister,
  actionUpdateCashRegister,
  type ActionResponse,
} from "@/actions/cash-register-actions";
import ResponsiveDialog from "@/app/_components/responsive-dialog";
import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";
import type { CashRegister } from "@/server/db/schema/cash-register";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "../delete-dialog";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";
interface EditCashRegisterProps {
  data: CashRegister;
  className?: string;
  children?: React.ReactNode;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function EditCashRegister({
  data,
  children,
}: EditCashRegisterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateCashRegister,
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
      triggerButton={
        children ?? <Button className="rounded-full">Editar Caixa</Button>
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Editar Caixa"
    >
      <form
        key={isOpen ? "open" : "closed"}
        action={formAction}
        className="space-y-4"
      >
        <input type="hidden" name="id" value={data.id} />
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <DatePicker id="date" name="date" required defaultValue={data.date} />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.date[0]}
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
        <div className="mt-8 flex gap-2">
          <DeleteDialog
            onConfirm={() => {
              void actionDeleteCashRegister(data.id);
            }}
          />
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
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
    </ResponsiveDialog>
  );
}
