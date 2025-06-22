"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionCreateIncome,
  type ActionResponse,
} from "@/actions/income-actions";
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

interface AddIncomeProps {
  className?: string;
  children?: React.ReactNode;
}

export default function AddIncome({
  className,
  children,
}: AddIncomeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionCreateIncome,
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
            Adicionar Receita
          </Button>
        )
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Adicionar Receita"
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
          <Label htmlFor="value">Receita Total</Label>
          <CurrencyInput
            id="value"
            name="value"
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
        <div className="space-y-2">
          <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
          <input
            id="profitMargin"
            name="profitMargin"
            type="number"
            step="0.01"
            min={0}
            max={100}
            defaultValue="28"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {errors.profitMargin && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.profitMargin[0]}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Adicionando..." : "Adicionar"}
        </Button>
        {/* General message area for non-field errors/messages */}
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