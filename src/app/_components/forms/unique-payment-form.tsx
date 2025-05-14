"use client";

import { useState, useEffect } from "react";
import { actionAddOneTimeExpense } from "@/actions/expense-actions";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getToday } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/app/_components/forms/field-error";
import { DatePicker } from "@/components/inputs/date-picker";
import CurrencyInput from "@/components/inputs/currency-input";

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
}: {
  source: ExpenseInsert["source"];
  description: string;
  amount: number;
  onSuccess?: () => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAmountChange: (value: number) => void;
}) {
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);

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

  const handleDueDateChange = (date: string | null) => {
    if (date) setDueDate(date);
  };
  const handleIsPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPaid(e.target.checked);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setState(initialState);

    if (!date) {
      toast.error("A data de vencimento é obrigatória.");
      setPending(false);
      return;
    }

    const formData = new FormData();
    formData.append("date", date);
    formData.append("type", "one_time");
    formData.append("source", source);
    formData.append("description", description);
    formData.append("value", amount.toString());
    if (isPaid) formData.append("isPaid", "on");

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
    setPending(false);
  }

  return (
    <form
      className="container mx-auto grid h-full max-h-full max-w-screen-lg grid-rows-[1fr_auto] gap-2"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="type" value="one_time" />
      <input type="hidden" name="source" value={source} />
      <div className="flex flex-col gap-4 overflow-y-auto">
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
          />
          <FieldError messages={errors?.description} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Valor</Label>
          <CurrencyInput
            id="totalAmount"
            name="totalAmount"
            step="0.01"
            min={0}
            value={amount}
            onValueChange={(v) => handleAmountChange(v ?? 0)}
            required
          />
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
        <div className="flex items-center gap-2">
          <Label htmlFor="isPaid">Pago</Label>
          <Input
            type="checkbox"
            id="isPaid"
            name="isPaid"
            checked={isPaid}
            onChange={handleIsPaidChange}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Salvando..." : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
