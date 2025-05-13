"use client";

import { useActionState, useEffect, useState } from "react";
import { actionCreateRecurringExpense } from "@/actions/recurring-expense-actions";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/inputs/date-picker";
import CurrencyInput from "@/components/inputs/currency-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FieldError } from "@/app/_components/forms/field-error";
import { type ActionResponse } from "@/actions/recurring-expense-actions";

const recurrenceOptions = [
  { value: "monthly", label: "Mensal" },
  { value: "weekly", label: "Semanal" },
  { value: "yearly", label: "Anual" },
];

const initialState = {
  success: false,
  message: "",
  errors: {},
};

export function RecurringExpenseForm() {
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionCreateRecurringExpense,
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
  const [startDate, setStartDate] = useState<string | undefined>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  return (
    <form
      action={formAction}
      className="container mx-auto flex h-full max-w-screen-lg flex-1 flex-col gap-2 px-5"
    >
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
          >
            {recurrenceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <FieldError messages={errors.recurrenceType} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Início</Label>
          <DatePicker
            id="startDate"
            name="startDate"
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
