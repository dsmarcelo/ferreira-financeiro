"use client";

import { useActionState, useEffect, useState } from "react";
import { actionAddRecurringExpense } from "@/actions/expense-actions";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/inputs/date-picker";
import CurrencyInput from "@/components/inputs/currency-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FieldError } from "@/app/_components/forms/field-error";
import { type ActionResponse } from "@/actions/expense-actions";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";

const recurrenceOptions = [
  { value: "monthly", label: "Mensal" },
  { value: "weekly", label: "Semanal" },
  { value: "yearly", label: "Anual" },
  { value: "custom_days", label: "Personalizado (dias)" },
];

const initialState = {
  success: false,
  message: "",
};

export function RecurringExpenseForm({
  source,
  description,
  handleDescriptionChange,
  handleAmountChange,
  onSuccess,
  amount,
  id,
}: {
  source: ExpenseInsert["source"];
  description: string;
  amount: number;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAmountChange: (value: number) => void;
  onSuccess?: () => void;
  id?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionAddRecurringExpense,
    initialState,
  );

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      onSuccess?.();
    } else if (!state.success && state.message) toast.error(state.message);
  }, [state, onSuccess]);

  const errors = state.errors ?? {};
  const [recurrenceType, setRecurrenceType] = useState("monthly");
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);
  const [startDate, setStartDate] = useState<string | undefined>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string | undefined>(undefined);

  return (
    <form
      id={id}
      action={formAction}
      className="container mx-auto flex h-full max-w-screen-lg flex-1 flex-col gap-2"
      autoComplete="off"
    >
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="type" value="recurring" />
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            type="text"
            id="description"
            name="description"
            value={description}
            placeholder="Netflix, Assinatura mensal, etc."
            onChange={handleDescriptionChange}
            required
          />
          <FieldError messages={errors.description} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Valor</Label>
          <CurrencyInput
            id="value"
            name="value"
            step="0.01"
            min={0}
            value={amount}
            onValueChange={(v) => handleAmountChange(v ?? 0)}
            required
          />
          <FieldError messages={errors.value} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recurrenceType">Recorrência</Label>
          <select
            id="recurrenceType"
            name="recurrenceType"
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value)}
            className="border-input ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Recorrência"
            required
            aria-describedby="recurrenceType-desc"
          >
            {recurrenceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div id="recurrenceType-desc" className="sr-only">
            Selecione o tipo de recorrência. Escolha &quot;Personalizado
            (dias)&quot; para definir um intervalo específico de dias.
          </div>
          <FieldError messages={errors.recurrenceType} />
        </div>
        {recurrenceType === "custom_days" && (
          <div className="space-y-2">
            <Label htmlFor="recurrenceInterval">Intervalo de dias</Label>
            <Input
              id="recurrenceInterval"
              name="recurrenceInterval"
              type="number"
              min={1}
              value={recurrenceInterval}
              onChange={(e) =>
                setRecurrenceInterval(Number(e.target.value) || 1)
              }
              required
              aria-describedby="recurrenceInterval-desc"
            />
            <div
              id="recurrenceInterval-desc"
              className="text-muted-foreground text-xs"
            >
              Quantos dias entre cada repetição?
            </div>
            <FieldError messages={errors.recurrenceInterval} />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="startDate">Início</Label>
          <DatePicker
            id="date"
            name="date"
            value={startDate}
            onChange={(d: string | undefined) => setStartDate(d ?? undefined)}
            required
            shortDate
          />
          <FieldError messages={errors.date} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recurrenceEndDate">Fim (opcional)</Label>
          <DatePicker
            id="recurrenceEndDate"
            name="recurrenceEndDate"
            value={recurrenceEndDate ?? ""}
            onChange={(d: string | undefined) => setRecurrenceEndDate(d ?? undefined)}
            shortDate
          />
          <FieldError messages={errors.recurrenceEndDate} />
        </div>
      </div>
      <div className="mt-2 flex flex-col">
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
      </div>
    </form>
  );
}
