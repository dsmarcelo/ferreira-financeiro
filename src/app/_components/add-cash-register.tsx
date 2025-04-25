"use client";

import { useActionState } from "react";
import { actionCreateCashRegister } from "@/actions/cash-register-actions";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initialState = {
  message: "",
  amount: undefined,
  date: new Date().toISOString().split("T")[0],
};

export default function AddCashRegister({ className }: { className?: string }) {
  // useActionState returns [state, formAction, pending]
  const [state, formAction, pending] = useActionState(
    actionCreateCashRegister,
    initialState,
  );

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Helper: Parse error messages for each field
  const errorMessages = (state?.message || "").split("; ").filter(Boolean);
  const dateError = errorMessages.find((msg) =>
    msg.toLowerCase().includes("data"),
  );
  const amountError = errorMessages.find((msg) =>
    msg.toLowerCase().includes("valor"),
  );
  const isSuccess = state?.message === "Caixa adicionado com sucesso!";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn("rounded-full", className)}>
          Adicionar Caixa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Caixa</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="date">Data</label>
            <Input
              type="date"
              id="date"
              lang="pt-BR"
              name="date"
              required
              defaultValue={today}
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
