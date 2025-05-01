"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionCreateCashRegister,
  type ActionResponse,
} from "@/actions/cash-register-actions";
import ResponsiveDialog from "@/app/_components/responsive-dialog";
import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";

const initialState: ActionResponse = {
  success: false,
  message: "",
};

interface AddCashRegisterProps {
  className?: string;
  children?: React.ReactNode;
}

export default function AddCashRegister({
  className,
  children,
}: AddCashRegisterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionCreateCashRegister,
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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <ResponsiveDialog
      triggerButton={
        children ?? (
          <Button className={cn("rounded-full", className)}>
            Adicionar Caixa
          </Button>
        )
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <form
        key={isOpen ? "open" : "closed"}
        action={formAction}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <DatePicker id="date" name="date" required defaultValue={today} />
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
          />
          {errors.value && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.value[0]}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Adicionando..." : "Adicionar"}
        </Button>
      </form>
    </ResponsiveDialog>
  );
}
