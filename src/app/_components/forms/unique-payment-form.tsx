"use client";

import { useState, useEffect } from "react";
import { actionAddOneTimeExpense } from "@/actions/expense-actions";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import { Button } from "@/components/ui/button";
import { getToday } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/app/_components/forms/field-error";
import { DatePicker } from "@/components/inputs/date-picker";

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
}: {
  source: ExpenseInsert["source"];
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
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>(() => getToday());
  const [isPaid, setIsPaid] = useState(false);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };
  const handleAmountChange = (value: number) => {
    setAmount(value);
  };
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

    if (!dueDate) {
      toast.error("A data de vencimento é obrigatória.");
      setPending(false);
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("value", amount.toString());
    formData.append("date", dueDate);
    formData.append("type", "one_time");
    formData.append("source", source);
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
      setDescription("");
      setAmount(0);
      setDueDate(getToday());
      setIsPaid(false);
    }
    setPending(false);
  }

  return (
    <form
      className="container mx-auto flex h-full max-w-screen-lg flex-1 flex-col gap-2 px-5"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="type" value="one_time" />
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          type="text"
          id="description"
          name="description"
          value={description}
          placeholder="Ex: Compra/Boleto não parcelado"
          onChange={handleDescriptionChange}
          required
        />
        <FieldError messages={errors?.description} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Valor</Label>
        <CurrencyInput
          id="amount"
          name="amount"
          step="0.01"
          min={0}
          value={amount}
          onValueChange={(v) => handleAmountChange(v ?? 0)}
          required
        />
        <FieldError messages={errors?.value} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dueDate">Data de vencimento</Label>
        <DatePicker
          id="dueDate"
          name="dueDate"
          value={dueDate}
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
      <Button type="submit" disabled={pending} className="mt-4">
        {pending ? "Salvando..." : "Adicionar"}
      </Button>
    </form>
  );
}
