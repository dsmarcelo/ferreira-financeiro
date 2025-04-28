"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionDeleteCashRegister,
  actionUpdateCashRegister,
  type ActionResponse,
} from "@/actions/cash-register-actions";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CurrencyInput from "@/components/inputs/currency-input";
import type { CashRegister } from "@/server/db/schema/cash-register";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "./delete-dialog";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";
interface EditCashRegisterProps {
  data: CashRegister;
  className?: string;
  children: React.ReactNode;
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
    if (!isOpen) return;
    if (state.success === true && state.message) {
      toast.success(state.message);
      setIsOpen(false);
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state, isOpen]);

  // Parse error messages from ActionResponse
  const errors = state?.errors ?? {};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Caixa</DialogTitle>
          <DialogDescription aria-hidden="true"></DialogDescription>
        </DialogHeader>
        <form
          key={isOpen ? "open" : "closed"} // This resets the form state
          action={formAction}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={data.id} />
          <div>
            <label htmlFor="date">Data</label>
            <DatePicker
              id="date"
              name="date"
              required
              defaultValue={data.date}
            />
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
              initialValue={Number(data.value)}
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-500" aria-live="polite">
                {errors.value[0]}
              </p>
            )}
          </div>
          <div className="flex justify-between gap-2">
            <DeleteDialog
              onConfirm={() => {
                void actionDeleteCashRegister(data.id);
              }}
            />
            <Button className="rounded-full" type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
