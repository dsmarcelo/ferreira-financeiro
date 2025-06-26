"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionDeleteIncome,
  actionUpdateIncome,
  type ActionResponse,
} from "@/actions/income-actions";
import ResponsiveDialog from "@/app/_components/responsive-dialog";
import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";
import type { Income } from "@/server/db/schema/incomes-schema";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "../delete-dialog";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";

interface EditIncomeProps {
  data: Income;
  className?: string;
  children?: React.ReactNode;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
};

// TODO: make this a form to use in a page or inside a dialog

export default function EditIncome({ data, children }: EditIncomeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateIncome,
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
        children ?? <Button className="rounded-full">Editar Receita</Button>
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Editar Receita"
    >
      <form
        key={isOpen ? "open" : "closed"}
        action={formAction}
        className="space-y-4"
      >
        <input type="hidden" name="id" value={data.id} />
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="Descrição da receita"
            defaultValue={data.description || ""}
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
          <DatePicker
            id="date"
            name="date"
            required
            defaultValue={
              data.dateTime
                ? new Date(data.dateTime).toISOString().split("T")[0]
                : ""
            }
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.date?.[0]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Hora</Label>
          <input
            id="time"
            name="time"
            type="time"
            defaultValue={
              data.dateTime
                ? new Date(data.dateTime).toTimeString().slice(0, 5)
                : "12:00"
            }
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
          <CurrencyInput
            id="value"
            name="value"
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
        <div className="space-y-2">
          <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
          <input
            id="profitMargin"
            name="profitMargin"
            type="number"
            step="0.01"
            min={0}
            max={100}
            defaultValue={Number(data.profitMargin)}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {errors.profitMargin && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.profitMargin[0]}
            </p>
          )}
        </div>
        <div className="mt-8 flex gap-2">
          <DeleteDialog
            onConfirm={() => {
              void actionDeleteIncome(data.id);
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
