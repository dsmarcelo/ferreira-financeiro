"use client";

import { useActionState, useState } from "react";
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

// Props: id (string), date (YYYY-MM-DD), amount (number), className (optional)
interface EditCashRegisterProps {
  data: CashRegister;
  className?: string;
  children: React.ReactNode;
}

// Initial state for useActionState
const initialState = {
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

  // Parse error messages for each field
  const errorMessages = (state?.message ?? "").split("; ").filter(Boolean);
  const dateError = errorMessages.find((msg) =>
    msg.toLowerCase().includes("data"),
  );
  const amountError = errorMessages.find((msg) =>
    msg.toLowerCase().includes("valor"),
  );
  const isSuccess = state?.message === "Caixa atualizado com sucesso!";

  // Close dialog on success
  if (isSuccess) {
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Caixa</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {/* Hidden input for ID */}
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
            {/* Show error below the date input if present */}
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
            {/* Show error below the amount input if present */}
            {amountError && (
              <p className="mt-1 text-sm text-red-500" aria-live="polite">
                {amountError}
              </p>
            )}
          </div>
          {/* Show success or general error message */}
          {state?.message && isSuccess && (
            <p className="font-medium text-green-600" aria-live="polite">
              {state.message}
            </p>
          )}
          {state?.message && !isSuccess && !dateError && !amountError && (
            <p className="text-red-500" aria-live="polite">
              {state.message}
            </p>
          )}
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
