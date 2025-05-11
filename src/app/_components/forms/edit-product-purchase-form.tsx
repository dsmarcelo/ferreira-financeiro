"use client";

import { useActionState, useState, useEffect } from "react";
import type {
  ProductPurchaseWithInstallments,
  ProductPurchaseInstallment,
} from "@/server/db/schema/product-purchase";
import {
  actionUpdateProductPurchase,
  actionDeleteProductPurchase,
  type ActionResponse,
} from "@/actions/product-purchase-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import { toast } from "sonner";
import InstallmentItemForm from "./installment-item-form";

interface EditProductPurchaseFormProps {
  productPurchase: ProductPurchaseWithInstallments;
}

const initialState: ActionResponse = { success: false, message: "" };

export default function EditProductPurchaseForm({
  productPurchase,
}: EditProductPurchaseFormProps) {
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateProductPurchase,
    initialState,
  );
  const [installments, setInstallments] = useState<
    ProductPurchaseInstallment[]
  >(productPurchase.installments ?? []);

  // Local state for totalAmount, initialized from productPurchase
  const [totalAmount, setTotalAmount] = useState<number>(
    Number(productPurchase.totalAmount ?? 0),
  );

  const [optimisticInstallments, setOptimisticInstallments] =
    useState<ProductPurchaseInstallment[]>(installments);

  // Handler for when any field changes in an installment
  const handleInstallmentFieldChange = (
    id: number,
    field: keyof ProductPurchaseInstallment,
    value: string | number | boolean | Date | undefined,
  ) => {
    setOptimisticInstallments((prev) => {
      const updated = prev.map((inst) =>
        inst.id === id ? { ...inst, [field]: value } : inst,
      );
      // If amount changed, recalculate total
      if (field === "amount") {
        const newTotal = updated.reduce(
          (sum, inst) => sum + Number(inst.amount ?? 0),
          0,
        );
        setTotalAmount(newTotal);
      }
      return updated;
    });
  };

  // Keep totalAmount in sync if installments change externally
  useEffect(() => {
    setOptimisticInstallments(installments);
    setTotalAmount(
      installments.reduce((sum, inst) => sum + Number(inst.amount ?? 0), 0),
    );
  }, [installments]);

  useEffect(() => {
    setInstallments(productPurchase.installments ?? []);
  }, [productPurchase.installments]);

  useEffect(() => {
    if (state.success && state.message) toast.success(state.message);
    else if (!state.success && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-8">
      <div className="grid grid-cols-1 gap-4">
        <Input
          name="description"
          defaultValue={productPurchase.description}
          required
        />
        <CurrencyInput
          name="totalAmount"
          value={totalAmount}
          required
          min={0}
          step={0.01}
          readOnly
        />
      </div>
      <div>
        <h2 className="mb-2 font-semibold">Parcelas</h2>
        <div className="grid grid-cols-5 gap-4">
          <p className="col-span-2">Descrição</p>
          <p className="col-span-2">Valor</p>
          <p>Data de vencimento</p>
          <p>Pago</p>
        </div>
        <div className="flex flex-col gap-2">
          {optimisticInstallments.map((installment) => (
            <InstallmentItemForm
              key={installment.id}
              installment={installment}
              onFieldChange={(field, value) =>
                handleInstallmentFieldChange(
                  installment.id,
                  field,
                  value ?? undefined,
                )
              }
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Salvando..." : "Salvar"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={async () => {
            await actionDeleteProductPurchase(productPurchase.id);
            toast.success("Compra excluída.");
          }}
        >
          Excluir
        </Button>
      </div>
      {state.message && (
        <p
          className={`mt-2 text-sm ${state.success ? "text-green-500" : "text-red-500"}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
