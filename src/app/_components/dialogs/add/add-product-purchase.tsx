"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionCreateProductPurchase,
  type ActionResponse,
} from "@/actions/product-purchase-actions";
import ResponsiveDialog from "@/app/_components/responsive-dialog";
import InstallmentsForm from "@/app/_components/forms/installments-form";
import type { ProductPurchaseInstallmentInsert } from "@/server/db/schema/product-purchase";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import { Button } from "@/components/ui/button";
import { cn, getToday } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { IsPaidCheckbox } from "@/app/_components/inputs/is-paid-input";
import { FieldError } from "@/app/_components/forms/field-error";
import { InstallmentErrorsList } from "@/app/_components/forms/installment-errors-list";

// Initial state for the form
const initialState: ActionResponse = {
  success: false,
  message: "",
};

// Dialog component for adding a product purchase
export default function AddProductPurchase({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionCreateProductPurchase,
    initialState,
  );

  // Handle success/error toasts and dialog state
  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  // Parse error messages from ActionResponse
  const errors = state.errors ?? {};

  // --- Installments logic ---
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0); // will be submitted as totalAmount
  const [numInstallments, setNumInstallments] = useState(1);
  const [installments, setInstallments] = useState<
    ProductPurchaseInstallmentInsert[]
  >([]);

  // Update installments when numInstallments, amount, or description changes
  // Helper to get today's date in YYYY-MM-DD

  // Helper to add months to a YYYY-MM-DD date string
  const addMonths = (dateStr: string, months: number) => {
    const date = new Date(dateStr);
    const d = date.getDate();
    date.setMonth(date.getMonth() + months);
    // Handle months with fewer days (e.g., Feb 30 → Feb 28/29)
    if (date.getDate() < d) {
      date.setDate(0); // Go to last day of previous month
    }
    return date.toISOString().split("T")[0] ?? "";
  };

  useEffect(() => {
    if (!numInstallments || numInstallments < 1) return;
    const baseAmount = Math.floor((amount * 100) / numInstallments) / 100;
    const remainder =
      Math.round((amount - baseAmount * numInstallments) * 100) / 100;
    const descBase = description || "";
    const today = getToday();
    const newInstallments = Array.from({ length: numInstallments }, (_, i) => ({
      amount: (i === numInstallments - 1
        ? baseAmount + remainder
        : baseAmount
      ).toFixed(2),
      dueDate: i === 0 ? today : addMonths(today, i),
      description:
        numInstallments === 1 ? descBase : `${descBase} ${i + 1}`.trim(),
      installmentNumber: i + 1,
      isPaid: false,
      productPurchaseId: 0, // will be set by backend
      paidAt: null,
      createdAt: undefined,
      updatedAt: undefined,
    }));
    setInstallments(newInstallments);
  }, [numInstallments, amount, description]);

  // Keep description in sync
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };
  // Keep amount in sync
  const handleAmountChange = (value: number) => {
    setAmount(value);
  };

  return (
    <ResponsiveDialog
      triggerButton={
        children ?? (
          <Button className={cn("rounded-full", className)}>
            Adicionar Compra de Produtos
          </Button>
        )
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Adicionar Compra de Produtos"
    >
      <form
        key={isOpen ? "open" : "closed"}
        action={formAction}
        className="space-y-4"
        onSubmit={(e) => {
          // Prevent submit if any installment is missing dueDate
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
          <Label htmlFor="numInstallments">Número de Parcelas</Label>
          <Input
            type="number"
            id="numInstallments"
            name="numInstallments"
            min={1}
            value={numInstallments}
            onChange={(e) =>
              setNumInstallments(Math.max(1, Number(e.target.value)))
            }
            required
          />
        </div>
        {/* InstallmentsForm renders the list of installments with calculated values */}
        <div className="space-y-2">
          <Label>Parcelas</Label>
          <InstallmentsForm
            installments={installments}
            onChange={setInstallments}
            disabled={false}
          />
          {/* Installment validation errors */}
          {errors.installments && errors.installments.length > 0 && (
            <InstallmentErrorsList errors={errors.installments} />
          )}
          {/* Hidden input for backend submission */}
          <input
            type="hidden"
            name="installments"
            value={JSON.stringify(installments)}
          />
        </div>
        <IsPaidCheckbox />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Adicionando..." : "Adicionar"}
        </Button>
        {/* General message area for non-field errors/messages */}
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
    </ResponsiveDialog>
  );
}
