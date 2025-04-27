"use client";

import { useActionState, useState, useEffect } from "react";
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
import { toast } from "sonner";

const initialState = {
  success: null as boolean | null,
  message: "",
};

export default function AddCashRegister({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    actionCreateCashRegister,
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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={cn("rounded-full", className)}>
          Adicionar Caixa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Caixa</DialogTitle>
        </DialogHeader>
        <form
          key={isOpen ? "open" : "closed"}
          action={formAction}
          className="space-y-4"
        >
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
            {amountError && (
              <p className="mt-1 text-sm text-red-500" aria-live="polite">
                {amountError}
              </p>
            )}
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
