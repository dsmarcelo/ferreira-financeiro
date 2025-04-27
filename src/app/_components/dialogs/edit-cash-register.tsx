"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionDeleteCashRegister,
  actionUpdateCashRegister,
} from "@/actions/cash-register-actions";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import type { CashRegister } from "@/server/db/schema/cash-register";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "./delete-dialog";
import { toast } from "sonner";

interface EditCashRegisterProps {
  data: CashRegister;
  className?: string;
  children: React.ReactNode;
}

const initialState = {
  success: null as boolean | null,
  message: "",
};

export default function EditCashRegister({
  data,
  children,
}: EditCashRegisterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    actionUpdateCashRegister,
    initialState,
  );

  // Handle success/error toasts and dialog state
  useEffect(() => {
    if (state.success === true) {
      toast.success(state.message);
      setIsOpen(false);
    } else if (state.success === false) {
      toast.error(state.message);
    }
  }, [state]);

  // Parse error messages
  const errorMessages = (state?.message ?? "").split("; ").filter(Boolean);
  const dateError = errorMessages.find((msg) =>
    msg.toLowerCase().includes("data"),
  );
  const amountError = errorMessages.find((msg) =>
    msg.toLowerCase().includes("valor"),
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Caixa</DialogTitle>
        </DialogHeader>
        <form
          key={isOpen ? "open" : "closed"} // This resets the form state
          action={formAction}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={data.id} />
          <div>
            <label htmlFor="date">Data</label>
            <Input
              type="date"
              id="date"
              lang="pt-BR"
              name="date"
              required
              defaultValue={data.date}
            />
            {dateError && (
              <p className="mt-1 text-sm text-red-500" aria-live="polite">
                {dateError}
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
            {amountError && (
              <p className="mt-1 text-sm text-red-500" aria-live="polite">
                {amountError}
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
