"use client";

import {
  useActionState,
  useState,
  useEffect,
  useOptimistic,
  startTransition,
} from "react";
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
import { ExpenseListItem } from "../lists/expense-list-item";

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

  const [optimisticInstallments, setOptimisticInstallments] = useOptimistic(
    installments,
    (
      state: ProductPurchaseInstallment[],
      update: { id: number; checked: boolean },
    ) =>
      state.map((item) =>
        item.id === update.id ? { ...item, isPaid: update.checked } : item,
      ),
  );

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
          defaultValue={Number(productPurchase.totalAmount)}
          required
          min={0}
          step={0.01}
        />
      </div>
      <div>
        <h2 className="mb-2 font-semibold">Parcelas</h2>
        <div className="flex flex-col gap-2">
          {optimisticInstallments.map((installment) => (
            <ExpenseListItem
              key={installment.id}
              expense={{
                id: installment.id,
                description: installment.description,
                isPaid: installment.isPaid,
                createdAt: installment.createdAt,
                updatedAt: installment.updatedAt,
                dueDate: installment.dueDate,
                value: installment.amount,
              }}
              onTogglePaid={(id, checked) => {
                startTransition(() => {
                  setOptimisticInstallments({
                    id,
                    checked,
                  });
                });
              }}
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
