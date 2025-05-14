"use client";

import { useState, useEffect, useCallback } from "react";
import { actionAddInstallmentExpense } from "@/actions/expense-actions";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getToday } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
// FieldError used in the component when needed
import { FieldError } from "@/app/_components/forms/field-error";
import { Minus, Plus } from "lucide-react";
import CurrencyInput from "@/components/inputs/currency-input";
import InstallmentItemForm from "./installment-item-form";
import type {
  InstallmentItem,
  InstallmentField,
} from "./installment-item-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InstallmentExpenseFormProps {
  source: ExpenseInsert["source"];
  description: string;
  amount: number;
  onSuccess?: () => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAmountChange: (value: number) => void;
  id?: string;
}

// Using the InstallmentItem and InstallmentField types imported from installment-item-form.tsx

// Define a properly typed initial state
type FormState = {
  success: boolean;
  message: string;
  errors: Partial<Record<keyof ExpenseInsert, string[]>>;
};

const initialState: FormState = {
  success: false,
  message: "",
  errors: {},
};

export function InstallmentExpenseForm({
  source,
  description,
  amount,
  onSuccess,
  handleDescriptionChange,
  handleAmountChange,
  id,
}: InstallmentExpenseFormProps) {
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState(1);
  const [installments, setInstallments] = useState<InstallmentItem[]>([]);
  const [recurrenceType, setRecurrenceType] = useState<string>("monthly");
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);

  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  // Extract errors from state to use in the form
  const errors = state.errors ?? {};

  // Format a date as YYYY-MM-DD safely
  const formatDateString = (date: Date | undefined): string => {
    if (!date) return getToday();
    try {
      return date.toISOString().split("T")[0] ?? getToday();
    } catch (error) {
      console.error("Error formatting date:", error);
      return getToday();
    }
  };

  // Update installment descriptions when main description changes
  useEffect(() => {
    if (installments.length > 0) {
      setInstallments((currentInstallments) => {
        return currentInstallments.map((item) => ({
          ...item,
          description:
            totalInstallments === 1
              ? description
              : `${description} | ${item.installmentNumber}/${totalInstallments}`,
        }));
      });
    }
  }, [description, totalInstallments, installments.length]);

  // Calculate due dates based on recurrence type - wrapped in useCallback to avoid dependency issues
  const calculateDueDate = useCallback(
    (index: number) => {
      // First installment is always today
      if (index === 0) {
        return new Date();
      }

      // For subsequent installments, calculate based on recurrence type
      const today = new Date();
      const baseDate = new Date(today);

      switch (recurrenceType) {
        case "weekly":
          baseDate.setDate(baseDate.getDate() + 7 * index);
          break;
        case "monthly":
          baseDate.setMonth(baseDate.getMonth() + index);
          break;
        case "yearly":
          baseDate.setFullYear(baseDate.getFullYear() + index);
          break;
        case "custom_days":
          baseDate.setDate(baseDate.getDate() + recurrenceInterval * index);
          break;
        default:
          baseDate.setMonth(baseDate.getMonth() + index);
      }

      return baseDate;
    },
    [recurrenceType, recurrenceInterval],
  );

  // Initialize or update installments when totalInstallments or recurrence settings change
  useEffect(() => {
    // Create a new array with the correct number of installments
    // We use a function to avoid closure issues with the installments dependency
    setInstallments((currentInstallments) => {
      const baseAmount = Math.floor((amount * 100) / totalInstallments) / 100;
      const remainder =
        Math.round((amount - baseAmount * totalInstallments) * 100) / 100;

      const newInstallments: InstallmentItem[] = [];

      for (let i = 0; i < totalInstallments; i++) {
        const installmentValue = (
          i === totalInstallments - 1 ? baseAmount + remainder : baseAmount
        ).toFixed(2);

        // Calculate due date based on recurrence type and index
        // First installment is always today, others follow recurrence pattern
        const dueDate = calculateDueDate(i);

        // If we already have this installment, preserve its data, otherwise create new
        const existingInstallment = currentInstallments[i];

        // Create a new fully-typed object with all required properties
        const installmentDescription =
          existingInstallment?.description ??
          (totalInstallments === 1
            ? description
            : `${description} | ${i + 1}/${totalInstallments}`);

        const newInstallment: InstallmentItem = {
          installmentNumber: i + 1,
          totalInstallments,
          description: installmentDescription,
          amount: existingInstallment?.amount ?? installmentValue,
          dueDate: existingInstallment?.dueDate ?? dueDate,
          isPaid: existingInstallment?.isPaid ?? false,
        };

        newInstallments.push(newInstallment);
      }

      return newInstallments;
    });
  }, [
    totalInstallments,
    amount,
    recurrenceType,
    recurrenceInterval,
    description,
    calculateDueDate,
  ]);

  // Handle field changes for a specific installment
  const handleInstallmentChange = (
    index: number,
    field: InstallmentField,
    value: string | number | boolean | Date | undefined,
  ) => {
    setInstallments((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setState(initialState);

    // Validation
    if (
      !description ||
      !amount ||
      !totalInstallments ||
      installments.length === 0
    ) {
      toast.error("Preencha todos os campos obrigatórios.");
      setPending(false);
      return;
    }

    // Check that all installments have valid data
    const invalidInstallments = installments.filter((item) => {
      return !item.description || !item.amount;
    });

    if (invalidInstallments.length > 0) {
      toast.error("Todas as parcelas precisam ter uma descrição e valor.");
      setPending(false);
      return;
    }

    // Ensure all installments have valid dates - if not, set them based on recurrence pattern
    const updatedInstallments = installments.map((item, index) => {
      // Always ensure required fields are present with non-null values
      const updatedItem: InstallmentItem = {
        installmentNumber: item.installmentNumber || index + 1,
        totalInstallments: item.totalInstallments || totalInstallments,
        description: item.description || "",
        amount: item.amount || "0",
        dueDate: item.dueDate || calculateDueDate(index),
        isPaid: item.isPaid || false,
      };
      return updatedItem;
    });

    // Update installments with fixed dates if needed
    if (JSON.stringify(updatedInstallments) !== JSON.stringify(installments)) {
      setInstallments(updatedInstallments);
    }

    // Generate a unique groupId for this group of expenses (installments)
    const groupId = crypto.randomUUID();
    let hasError = false;

    for (const installment of installments) {
      const formData = new FormData();
      // Ensure all values are defined with fallbacks to avoid TypeScript errors
      const description = installment.description || "";
      const amount = installment.amount || "0";

      // Format date safely using our helper function
      const formattedDate = formatDateString(installment.dueDate);

      const installmentNum = String(installment.installmentNumber || 1);
      const totalInstallmentsStr = String(installment.totalInstallments || 1);

      formData.append("description", description);
      formData.append("value", amount);
      formData.append("date", formattedDate);
      formData.append("type", "installment");
      formData.append("source", source);
      formData.append("installmentNumber", installmentNum);
      formData.append("totalInstallments", totalInstallmentsStr);
      formData.append("groupId", groupId);
      formData.append("recurrenceType", recurrenceType);

      if (recurrenceType === "custom_days") {
        formData.append("recurrenceInterval", String(recurrenceInterval));
      }
      if (installment.isPaid) {
        formData.append("isPaid", "on");
      }

      const res = await actionAddInstallmentExpense(initialState, formData);
      if (!res.success) {
        hasError = true;
        setState({
          success: res.success,
          message: res.message,
          errors: res.errors ?? {},
        });
        toast.error(res.message);
        break;
      }
    }

    setPending(false);
    if (!hasError) {
      setTotalInstallments(1);
      setState({
        success: true,
        message: "Despesas adicionadas com sucesso!",
        errors: {}, // Always provide an empty object for errors, never undefined
      });
      toast.success("Despesas parceladas adicionadas com sucesso!");
      if (onSuccess) {
        onSuccess();
      }
    }
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className="flex h-full max-h-full flex-col gap-2"
    >
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
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
        <div className="flex w-full flex-row gap-2">
          <div className="w-full">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Valor</Label>
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
            </div>
            <FieldError messages={errors?.value} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalInstallments">Número de Parcelas</Label>
            <div className="flex items-center">
              <Button
                size="icon"
                type="button"
                variant="outline"
                className="rounded-r-none"
                onClick={() => {
                  if (totalInstallments <= 1) return;
                  setTotalInstallments(totalInstallments - 1);
                }}
              >
                <Minus />
              </Button>
              <Input
                type="number"
                id="totalInstallments"
                name="totalInstallments"
                min={1}
                value={totalInstallments}
                onChange={(e) =>
                  setTotalInstallments(Math.max(1, Number(e.target.value)))
                }
                className="w-20 rounded-l-none rounded-r-none text-center"
                required
              />
              <Button
                size="icon"
                type="button"
                variant="outline"
                className="rounded-l-none"
                onClick={() => {
                  setTotalInstallments(totalInstallments + 1);
                }}
              >
                <Plus />
              </Button>
            </div>
            <FieldError messages={errors?.totalInstallments} />
          </div>
        </div>

        <div className="flex w-full flex-row gap-2">
          <div className="space-y-2">
            <Label htmlFor="recurrenceType">Tipo de Recorrência</Label>
            <Select
              value={recurrenceType}
              onValueChange={(value) => setRecurrenceType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de recorrência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
                <SelectItem value="custom_days">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {recurrenceType === "custom_days" && (
            <div className="w-full space-y-2">
              <Label htmlFor="recurrenceInterval">Intervalo</Label>
              <Input
                type="number"
                id="recurrenceInterval"
                name="recurrenceInterval"
                min={1}
                value={recurrenceInterval}
                onChange={(e) =>
                  setRecurrenceInterval(Math.max(1, Number(e.target.value)))
                }
                required
              />
            </div>
          )}
        </div>
        <div className="border-t pt-2">
          <Label className="mb-2">Parcelas</Label>
          <div className="space-y-6">
            {installments.map((installment, index) => (
              <InstallmentItemForm
                key={`installment-${index}`}
                installment={installment}
                onFieldChange={(field, value) => {
                  handleInstallmentChange(index, field, value);
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
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
      </div>
    </form>
  );
}
