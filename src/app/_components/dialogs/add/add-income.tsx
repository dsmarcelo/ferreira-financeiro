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

export default function AddIncome({ className, children }: AddIncomeProps) {
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

  // Get today's date in YYYY-MM-DD format using local timezone
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Sao_Paulo'
  });

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
          <Label htmlFor="description">Descrição</Label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="Descrição da receita"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.description?.[0]}
            </p>
          )}
        </div>
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
          <Label htmlFor="time">Hora</Label>
          <input
            id="time"
            name="time"
            type="time"
            defaultValue={new Date().toLocaleTimeString('pt-BR', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'America/Sao_Paulo'
            })}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.time?.[0]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Receita Total</Label>
          <CurrencyInput id="value" name="value" step="0.01" min={0} required />
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
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
