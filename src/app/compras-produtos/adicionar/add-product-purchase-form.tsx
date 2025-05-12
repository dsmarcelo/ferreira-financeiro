"use client";

import { useActionState, useEffect, useState } from "react";
import {
  actionCreateProductPurchase,
  type ActionResponse,
} from "@/actions/product-purchase-actions";
import InstallmentsForm from "@/app/_components/forms/installments-form";
import type { ProductPurchaseInstallmentInsert } from "@/server/db/schema/product-purchase";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import { Button } from "@/components/ui/button";
import { getToday } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/app/_components/forms/field-error";
import { InstallmentErrorsList } from "@/app/_components/forms/installment-errors-list";

const initialState: ActionResponse = {
  success: false,
  message: "",
};

interface AddProductPurchaseFormProps {
  header?: React.ReactNode;
}

export function AddProductPurchaseForm({ header }: AddProductPurchaseFormProps) {
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionCreateProductPurchase,
    initialState,
  );

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

  return (
    <div className="">
      {header}
      <form
        action={formAction}
        className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5"
        onSubmit={(e) => {
          if (installments.some((inst) => !inst.dueDate)) {
            e.preventDefault();
            toast.error("Preencha a data de vencimento de todas as parcelas.");
            return;
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            type="text"
            id="description"
            name="description"
            value={description}
            onChange={handleDescriptionChange}
            required
          />
          <FieldError messages={errors.description} />
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
            <FieldError messages={errors.totalAmount} />
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
                -
              </Button>
              <Button
                size="icon"
                type="button"
                onClick={() => {
                  setTotalInstallments(totalInstallments + 1);
                }}
              >
                +
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
          {errors.installments && errors.installments.length > 0 && (
            <InstallmentErrorsList errors={errors.installments} />
          )}
          <input
            type="hidden"
            name="installments"
            value={JSON.stringify(installments)}
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
    </div>
  );
}
