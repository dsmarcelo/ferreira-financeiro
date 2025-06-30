"use client";

import { useState, useEffect, useCallback } from "react";
import { actionAddOneTimeExpense } from "@/actions/expense-actions";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";
import { Input } from "@/components/ui/input";
import { getToday } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/app/_components/forms/field-error";
import { DatePicker } from "@/components/inputs/date-picker";
import CurrencyInput from "@/components/inputs/currency-input";
import { Checkbox } from "@/components/ui/checkbox";
import { CategorySelector } from "@/app/_components/inputs/category-selector";

const initialState: {
  success: boolean;
  message: string;
  errors: Partial<Record<keyof ExpenseInsert, string[]>>;
} = {
  success: false,
  message: "",
  errors: {},
};

export function UniquePaymentForm({
  source,
  description,
  amount,
  onSuccess,
  handleDescriptionChange,
  handleAmountChange,
  id,
}: {
  source: ExpenseInsert["source"];
  description: string;
  amount: number;
  onSuccess?: () => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAmountChange: (value: number) => void;
  id?: string;
}) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const errors = state.errors ?? {};
  const [date, setDueDate] = useState<string>(() => getToday());
  const [isPaid, setIsPaid] = useState(false);
  const [categoryId, setCategoryId] = useState<string>("");

  // Form state preservation
  const saveFormState = useCallback(() => {
    const formState = {
      description,
      amount: amount.toString(),
      date,
      isPaid: isPaid.toString(),
      categoryId,
      source,
    };
    sessionStorage.setItem('uniquePaymentFormState', JSON.stringify(formState));
  }, [description, amount, date, isPaid, categoryId, source]);

  // Restore form state on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem('uniquePaymentFormState');
    if (savedState) {
      try {
        const formState = JSON.parse(savedState) as Record<string, string>;

        // Restore states
        if (formState.date) setDueDate(formState.date);
        if (formState.isPaid) setIsPaid(formState.isPaid === 'true');
        if (formState.categoryId) setCategoryId(formState.categoryId);

        // Restore parent component states through handlers
        if (formState.description) {
          const syntheticEvent = {
            target: { value: formState.description }
          } as React.ChangeEvent<HTMLInputElement>;
          handleDescriptionChange(syntheticEvent);
        }
        if (formState.amount) {
          handleAmountChange(parseFloat(formState.amount));
        }

        // Clear saved state after restoration
        sessionStorage.removeItem('uniquePaymentFormState');
      } catch (error) {
        console.error('Failed to restore form state:', error);
      }
    }
  }, [handleDescriptionChange, handleAmountChange]);

  const handleDueDateChange = (date: string | null) => {
    if (date) setDueDate(date);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState(initialState);

    if (!date) {
      toast.error("A data de vencimento é obrigatória.");
      return;
    }

    const formData = new FormData();
    formData.append("date", date);
    formData.append("type", "one_time");
    formData.append("source", source);
    formData.append("description", description);
    formData.append("value", amount.toString());
    if (isPaid) formData.append("isPaid", "on");
    if (categoryId) formData.append("categoryId", categoryId);

    const res = await actionAddOneTimeExpense(initialState, formData);
    if (!res.success) {
      setState({
        success: false,
        message: res.message,
        errors: res.errors ?? {},
      });
      toast.error(res.message);
    } else {
      setState({
        success: true,
        message: "Despesa adicionada com sucesso!",
        errors: {},
      });
      toast.success("Despesa adicionada com sucesso!");
      setDueDate(getToday());
      setIsPaid(false);
      onSuccess?.();
    }
  }

  return (
    <form
      id={id}
      className="container mx-auto grid h-full max-h-full max-w-screen-lg grid-rows-[1fr_auto] gap-2"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="type" value="one_time" />
      <input type="hidden" name="source" value={source} />
      <div className="flex flex-col gap-2 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoria</Label>
          <CategorySelector
            name="categoryId"
            onValueChange={setCategoryId}
            required
            onBeforeNavigate={saveFormState}
          />
          <FieldError messages={errors.categoryId} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            type="text"
            id="description"
            name="description"
            value={description}
            placeholder="Ex: Compra/Boleto parcelado"
            onChange={handleDescriptionChange}
            required
            autoFocus
          />
          <FieldError messages={errors?.description} />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-full space-y-2">
            <Label htmlFor="totalAmount">Valor</Label>
            <div className="flex w-full items-center gap-2">
              <CurrencyInput
                id="totalAmount"
                name="totalAmount"
                step="0.01"
                min={0}
                value={amount}
                className="w-full"
                onValueChange={(v) => handleAmountChange(v ?? 0)}
                required
              />
              <Checkbox
                id="isPaid"
                name="isPaid"
                checked={isPaid}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setIsPaid(!!checked)
                }
              />
              <Label htmlFor="isPaid">Pago</Label>
            </div>
          </div>
        </div>
        <FieldError messages={errors?.value} />
        <div className="space-y-2">
          <Label htmlFor="date">Data de vencimento</Label>
          <DatePicker
            id="date"
            name="date"
            value={date}
            onChange={(date) => handleDueDateChange(date ?? null)}
            required
          />
          <FieldError messages={errors?.date} />
        </div>
      </div>
    </form>
  );
}
