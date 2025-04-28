"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionCreateCashRegister,
  type ActionResponse,
} from "@/actions/cash-register-actions";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import CurrencyInput from "@/components/inputs/currency-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function AddCashRegister({
  className,
  defaultDate,
  initialOpen = false,
  onOpenChange,
}: {
  className?: string;
  defaultDate?: string;
  initialOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);
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

  // Get today's date or use provided default date
  const today = defaultDate ?? new Date().toISOString().split("T")[0];

  // Open dialog programmatically when initialOpen changes to true
  useEffect(() => {
    if (initialOpen) {
      setIsOpen(true);
    }
  }, [initialOpen]);

  // Modified setter to notify parent
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
