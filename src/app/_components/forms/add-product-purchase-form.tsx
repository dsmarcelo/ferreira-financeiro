"use client";

import { useEffect, useState } from "react";
import { actionAddExpense } from "@/actions/expense-actions";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";
import InstallmentsForm from "@/app/_components/forms/installments-form";
import type { ProductPurchaseInstallmentInsert } from "@/server/db/schema/product-purchase";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import { Button } from "@/components/ui/button";
import { getToday } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/app/_components/forms/field-error";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RecurringExpenseForm } from "../../compras-produtos/adicionar/recurring-expense-form";
import { Minus, Plus } from "lucide-react";
import { UniquePaymentForm } from "./unique-payment-form";

const initialState: {
  success: boolean;
  message: string;
  errors: Partial<Record<keyof ExpenseInsert, string[]>>;
} = {
  success: false,
  message: "",
  errors: {},
};

export function AddProductPurchaseForm() {
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
  const [totalInstallments, setTotalInstallments] = useState(1);
  const [installments, setInstallments] = useState<
    ProductPurchaseInstallmentInsert[]
  >([]);

  const addMonths = (dateStr: string, months: number) => {
    const date = new Date(dateStr);
    const d = date.getDate();
    date.setMonth(date.getMonth() + months);
    if (date.getDate() < d) {
      date.setDate(0);
    }
    return date.toISOString().split("T")[0] ?? "";
  };

  useEffect(() => {
    if (!totalInstallments || totalInstallments < 1) return;
    const baseAmount = Math.floor((amount * 100) / totalInstallments) / 100;
    const remainder =
      Math.round((amount - baseAmount * totalInstallments) * 100) / 100;
    const descBase = description || "";
    const today = getToday();
    const newInstallments = Array.from(
      { length: totalInstallments },
      (_, i) => ({
        amount: (i === totalInstallments - 1
          ? baseAmount + remainder
          : baseAmount
        ).toFixed(2),
        dueDate: i === 0 ? today : addMonths(today, i),
        description:
          totalInstallments === 1
            ? descBase
            : `${descBase} | ${i + 1}/${totalInstallments}`.trim(),
        installmentNumber: i + 1,
        isPaid: false,
        totalInstallments,
        productPurchaseId: 0, // will be set by backend
        paidAt: null,
        createdAt: undefined,
        updatedAt: undefined,
      }),
    );
    setInstallments(newInstallments);
  }, [totalInstallments, amount, description]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };
  const handleAmountChange = (value: number) => {
    setAmount(value);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setState(initialState);
    let hasError = false;

    // Generate a unique installmentId for this group of expenses (installments)
    // Using crypto.randomUUID() for a collision-resistant UUID
    const installmentId = crypto.randomUUID();

    for (const inst of installments) {
      if (!inst) continue;
      const formData = new FormData();
      formData.append("description", inst.description ?? "");
      formData.append("value", inst.amount ?? "");
      formData.append("date", inst.dueDate ?? "");
      formData.append("type", "installment");
      formData.append("source", "product_purchase");
      if (inst.isPaid) formData.append("isPaid", "on");
      if (inst.installmentNumber !== undefined)
        formData.append("installmentNumber", String(inst.installmentNumber));
      if (totalInstallments !== undefined)
        formData.append("totalInstallments", String(totalInstallments));
      formData.append("installmentId", String(installmentId)); // NEW: link all expenses to this group
      const res = await actionAddExpense(initialState, formData);
      if (!res.success) {
        setState({
          success: false,
          message: res.message,
          errors: res.errors ?? {},
        });
        toast.error(res.message);
        hasError = true;
        break;
      }
    }
    if (!hasError) {
      setState({
        success: true,
        message: "Despesas adicionadas com sucesso!",
        errors: {},
      });
      toast.success("Despesas adicionadas com sucesso!");
    }
    setPending(false);
  }

  // Each expense created as part of an installment group now shares the same installmentId (integer), making it easy to fetch all related expenses from the backend.

  return (
    <div className="">
      <Tabs defaultValue="one_time" className="w-full">
        <TabsList className="mx-auto mb-4">
          <TabsTrigger value="one_time">Único</TabsTrigger>
          <TabsTrigger value="installment">Parcelado</TabsTrigger>
          <TabsTrigger value="recurring">Recorrente</TabsTrigger>
        </TabsList>
        <TabsContent value="one_time">
          <UniquePaymentForm source="product_purchase" />
        </TabsContent>
        <TabsContent value="installment">
          <form
            className="container mx-auto flex h-full max-w-screen-lg flex-1 flex-col gap-2 px-5"
            onSubmit={handleSubmit}
          >
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
            <div className="flex items-center gap-2">
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
                {/* 'totalAmount' is not a field in ExpenseInsert; use 'value' for error display */}
                <FieldError messages={errors?.value} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalInstallments">Número de Parcelas</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    id="totalInstallments"
                    name="totalInstallments"
                    min={1}
                    value={totalInstallments}
                    onChange={(e) =>
                      setTotalInstallments(Math.max(1, Number(e.target.value)))
                    }
                    required
                  />
                  <Button
                    size="icon"
                    type="button"
                    onClick={() => {
                      if (totalInstallments <= 1) return;
                      setTotalInstallments(totalInstallments - 1);
                    }}
                  >
                    <Minus />
                  </Button>
                  <Button
                    size="icon"
                    type="button"
                    onClick={() => {
                      setTotalInstallments(totalInstallments + 1);
                    }}
                  >
                    <Plus />
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Parcelas</Label>
              <InstallmentsForm
                installments={installments}
                onChange={setInstallments}
                disabled={false}
              />
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
        </TabsContent>
        <TabsContent value="recurring">
          <RecurringExpenseForm source="product_purchase" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
