"use client";

import { useActionState, useEffect, useState } from "react";
import { actionAddRecurringExpense } from "@/actions/expense-actions";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/inputs/date-picker";
import CurrencyInput from "@/components/inputs/currency-input";
import { Button } from "@/components/ui/button";
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
  errors: {},
};

export function RecurringExpenseForm({
  source,
}: {
  source: ExpenseInsert["source"];
}) {
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionAddRecurringExpense,
    initialState,
  );

  useEffect(() => {
    if (state.success && state.message) toast.success(state.message);
    else if (!state.success && state.message) toast.error(state.message);
  }, [state]);

  const errors = state.errors ?? {};
  const [description, setDescription] = useState("");
  const [value, setValue] = useState<number>(0);
  const [recurrenceType, setRecurrenceType] = useState("monthly");
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);
  const [startDate, setStartDate] = useState<string | undefined>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  return (
    <form
      action={formAction}
      className="container mx-auto flex h-full max-w-screen-lg flex-1 flex-col gap-2 px-5"
      autoComplete="off"
    >
      <input type="hidden" name="source" value={source} />
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          type="text"
          id="description"
          name="description"
          value={description}
          placeholder="Netflix, Assinatura mensal, etc."
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <FieldError messages={errors.description} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="space-y-2">
          <Label htmlFor="value">Valor</Label>
          <CurrencyInput
            id="value"
            name="value"
            step="0.01"
            min={0}
            value={value}
            onValueChange={(v) => setValue(v ?? 0)}
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
          <FieldError messages={errors.startDate} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Fim (opcional)</Label>
          <DatePicker
            id="endDate"
            name="endDate"
            value={endDate ?? ""}
            onChange={(d: string | undefined) => setEndDate(d ?? undefined)}
            shortDate
          />
          <FieldError messages={errors.endDate} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Adicionando..." : "Adicionar"}
      </Button>
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
  );
}
