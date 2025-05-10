"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionUpdateProductPurchase,
  actionDeleteProductPurchase,
  type ActionResponse,
} from "@/actions/product-purchase-actions";
import ResponsiveDialog from "@/app/_components/responsive-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import type {
  ProductPurchaseWithInstallments,
  ProductPurchaseInstallment,
} from "@/server/db/schema/product-purchase";
import {
  actionCreateProductPurchaseInstallment,
  actionUpdateProductPurchaseInstallment,
  actionDeleteProductPurchaseInstallment,
} from "@/actions/product-purchase-actions";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "../delete-dialog";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";
import { IsPaidCheckbox } from "../../inputs/is-paid-input";

interface EditProductPurchaseProps {
  data: ProductPurchaseWithInstallments;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function EditProductPurchase({
  data,
  open,
  onOpenChange,
  className,
  children,
}: EditProductPurchaseProps) {
  const [isOpen, setIsOpen] = useState(open ?? false);
  const [installments, setInstallments] = useState<
    ProductPurchaseInstallment[]
  >(data.installments ?? []);
  useEffect(() => {
    setIsOpen(open ?? false);
  }, [open]);
  useEffect(() => {
    setInstallments(data.installments ?? []);
  }, [data.installments]);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateProductPurchase,
    initialState,
  );

  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
      setIsOpen(false);
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const errors = state?.errors ?? {};

  return (
    <ResponsiveDialog
      triggerButton={
        children ?? (
          <Button className="rounded-full">Editar Compra de Produto</Button>
        )
      }
      isOpen={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        onOpenChange?.(open);
      }}
      title="Editar Compra de Produto"
    >
      <form
        key={isOpen ? "open" : "closed"}
        action={formAction}
        className="space-y-4"
      >
        <input type="hidden" name="id" value={data.id} />

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
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

        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
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

        <div className="space-y-2">
          <Label htmlFor="dueDate">Data</Label>
          <DatePicker
            id="dueDate"
            name="dueDate"
            required
            defaultValue={data.dueDate}
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.dueDate[0]}
            </p>
          )}
        </div>

        <IsPaidCheckbox isPaid={data.isPaid} />

        {/* Installments Section */}
        <div className="mt-6">
          <h3 className="mb-2 font-semibold">Parcelas</h3>
          <ul className="space-y-2">
            {installments.map((inst) => (
              <li
                key={inst.id}
                className="bg-muted flex flex-col gap-1 rounded-md border p-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium">
                    Parcela {inst.number}
                  </span>
                  <span className="text-xs">Vencimento: {inst.dueDate}</span>
                  <span className="text-xs">
                    Valor: R$ {Number(inst.value).toFixed(2)}
                  </span>
                  <span className="text-xs">
                    {inst.isPaid ? "Paga" : "Pendente"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async (e) => {
                      e.preventDefault();
                      const updated =
                        await actionUpdateProductPurchaseInstallment(inst.id, {
                          isPaid: !inst.isPaid,
                        });
                      if (updated) {
                        setInstallments((prev) =>
                          prev.map((i) =>
                            i.id === inst.id ? { ...i, isPaid: !i.isPaid } : i,
                          ),
                        );
                        toast.success("Status da parcela atualizado.");
                      }
                    }}
                  >
                    Marcar como {inst.isPaid ? "pendente" : "paga"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async (e) => {
                      e.preventDefault();
                      await actionDeleteProductPurchaseInstallment(inst.id);
                      setInstallments((prev) =>
                        prev.filter((i) => i.id !== inst.id),
                      );
                      toast.success("Parcela removida.");
                    }}
                  >
                    Remover
                  </Button>
                </div>
                {/* Optionally, add inline edit for amount/dueDate here */}
              </li>
            ))}
          </ul>
          {/* Add New Installment */}
          <form
            className="mt-4 flex flex-wrap gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const amount = Number(
                (form.elements.namedItem("amount") as HTMLInputElement).value,
              );
              const dueDate = (
                form.elements.namedItem("dueDate") as HTMLInputElement
              ).value;
              if (!amount || !dueDate) return;
              const newInstallment =
                await actionCreateProductPurchaseInstallment({
                  productPurchaseId: data.id,
                  installmentNumber: installments.length + 1,
                  amount,
                  dueDate,
                  isPaid: false,
                });
              if (newInstallment) {
                setInstallments((prev) => [...prev, newInstallment]);
                toast.success("Parcela adicionada.");
                form.reset();
              }
            }}
          >
            <CurrencyInput
              name="amount"
              placeholder="Valor"
              min={0}
              step={0.01}
              required
              className="w-24"
            />
            <Input name="dueDate" type="date" required className="w-32" />
            <Button type="submit" size="sm" variant="outline">
              Adicionar Parcela
            </Button>
          </form>
        </div>

        <div className="mt-8 flex gap-2">
          <DeleteDialog
            onConfirm={() => {
              void actionDeleteProductPurchase(data.id);
            }}
          />
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
        {state.message && (
          <>
            {state.success === true ? (
              <p className="mt-2 text-sm text-green-500" aria-live="polite">
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
    </ResponsiveDialog>
  );
}
