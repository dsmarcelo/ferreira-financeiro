"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionUpdateProductPurchase,
  actionDeleteProductPurchase,
  type ActionResponse,
} from "@/actions/product-purchase-actions";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import type { ProductPurchase } from "@/server/db/schema/product-purchase";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "./delete-dialog";
import { toast } from "sonner";

interface EditProductPurchaseProps {
  data: ProductPurchase;
  className?: string;
  children: React.ReactNode;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function EditProductPurchase({
  data,
  children,
}: EditProductPurchaseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateProductPurchase,
    initialState,
  );

  useEffect(() => {
    if (!isOpen) return;
    if (state.success === true && state.message) {
      toast.success(state.message);
      setIsOpen(false);
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state, isOpen]);

  const errors = state?.errors ?? {};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Despesa de Produto</DialogTitle>
          <DialogDescription aria-hidden="true"></DialogDescription>
        </DialogHeader>
        <form
          key={isOpen ? "open" : "closed"}
          action={formAction}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={data.id} />
          <div>
            <label htmlFor="date">Data</label>
            <Input
              type="date"
              id="date"
              lang="pt-BR"
              name="date"
              required
              defaultValue={data.date}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500" aria-live="polite">
                {errors.date[0]}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="amount">Valor</label>
            <CurrencyInput
              id="amount"
              name="amount"
              step="0.01"
              min={0}
              required
              initialValue={Number(data.value)}
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-500" aria-live="polite">
                {errors.value[0]}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="description">Descrição</label>
            <Input
              type="text"
              id="description"
              name="description"
              required
              defaultValue={data.description}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500" aria-live="polite">
                {errors.description[0]}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPaid"
              name="isPaid"
              defaultChecked={data.isPaid}
            />
            <label htmlFor="isPaid">Pago</label>
          </div>
          <div className="flex justify-between gap-2">
            <DeleteDialog
              onConfirm={() => {
                void actionDeleteProductPurchase(data.id);
              }}
            />
            <Button className="rounded-full" type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
