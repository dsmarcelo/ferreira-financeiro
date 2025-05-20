"use client";

import { useState, useEffect, useCallback } from "react";
import { actionAddInstallmentExpense } from "@/actions/expense-actions";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [firstInstallmentDate, setFirstInstallmentDate] = useState<
    Date | undefined
  >(undefined);

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
    if (!date) return ""; // Return empty string if no date, to be caught by validation
    try {
      return date.toISOString().split("T")[0] ?? "";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
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
    (
      baseDateForCalc: Date,
      installmentIndex: number, // 0-based index
      currentRecurrenceType: string,
      currentRecurrenceIntervalForCustom: number,
    ) => {
      // If it's the first installment (index 0), its date is the baseDateForCalc itself
      if (installmentIndex === 0) {
        return new Date(baseDateForCalc); // Return a new Date object to avoid mutation
      }

      const targetDate = new Date(baseDateForCalc);

      switch (currentRecurrenceType) {
        case "weekly":
          targetDate.setDate(targetDate.getDate() + 7 * installmentIndex);
          break;
        case "monthly":
          targetDate.setMonth(targetDate.getMonth() + installmentIndex);
          break;
        case "yearly":
          targetDate.setFullYear(targetDate.getFullYear() + installmentIndex);
          break;
        case "custom_days":
          targetDate.setDate(
            targetDate.getDate() +
              currentRecurrenceIntervalForCustom * installmentIndex,
          );
          break;
        default:
          targetDate.setMonth(targetDate.getMonth() + installmentIndex);
      }
      return targetDate;
    },
    [], // No dependencies needed as all params are passed in
  );

  // Initialize or update installments when totalInstallments or recurrence settings change
  useEffect(() => {
    setInstallments((currentInstallments) => {
      const newTotalInstallments = Math.max(1, totalInstallments);
      const installmentValue =
        amount > 0 && newTotalInstallments > 0
          ? Math.floor((amount * 100) / newTotalInstallments) / 100
          : 0;
      const remainder =
        amount > 0 && newTotalInstallments > 0
          ? Math.round(
              (amount - installmentValue * newTotalInstallments) * 100,
            ) / 100
          : 0;

      const resolvedFirstDate =
        firstInstallmentDate ?? currentInstallments[0]?.dueDate ?? new Date();

      const newInstallments = Array.from(
        { length: newTotalInstallments },
        (_, i) => {
          const currentItem = currentInstallments[i];
          const valueForThisInstallment = (
            i === newTotalInstallments - 1
              ? installmentValue + remainder
              : installmentValue
          ).toFixed(2);

          const dueDate = calculateDueDate(
            resolvedFirstDate,
            i,
            recurrenceType,
            recurrenceInterval,
          );

          return {
            installmentNumber: i + 1,
            totalInstallments: newTotalInstallments,
            description:
              currentItem?.description &&
              currentItem.totalInstallments === newTotalInstallments
                ? currentItem.description // Preserve description if total installments haven't changed
                : newTotalInstallments === 1
                  ? description
                  : `${description} | ${i + 1}/${newTotalInstallments}`,
            amount: valueForThisInstallment,
            dueDate:
              currentItem?.dueDate &&
              currentItem.totalInstallments === newTotalInstallments &&
              i === 0 &&
              firstInstallmentDate === undefined
                ? currentItem.dueDate // Preserve first installment's original date if not explicitly changed
                : dueDate,
            isPaid: currentItem?.isPaid ?? false,
          };
        },
      );
      return newInstallments;
    });
  }, [
    amount,
    totalInstallments,
    description,
    recurrenceType,
    recurrenceInterval,
    calculateDueDate,
    firstInstallmentDate,
  ]);

  // Handle field changes for a specific installment
  const handleInstallmentChange = (
    index: number,
    field: InstallmentField,
    value: string | number | boolean | Date | undefined,
  ) => {
    setInstallments((prev) => {
      const updated = [...prev];
      // @ts-expect-error it works
      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      // If the due date of the first installment is changed, update subsequent ones
      if (index === 0 && field === "dueDate" && value instanceof Date) {
        setFirstInstallmentDate(value); // Trigger main useEffect to recalculate all dates
        // The main useEffect will handle recalculating all dates based on this new firstInstallmentDate
      }
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
      return !item.description || !item.amount || !item.dueDate; // Added dueDate check
    });

    if (invalidInstallments.length > 0) {
      toast.error(
        "Todas as parcelas precisam ter uma descrição, valor e data de vencimento.",
      );
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
        dueDate:
          item.dueDate ||
          calculateDueDate(
            firstInstallmentDate ?? new Date(),
            index,
            recurrenceType,
            recurrenceInterval,
          ),
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
      if (!formattedDate) {
        // Check if date formatting returned an empty string (invalid date)
        toast.error(
          `Data de vencimento inválida para a parcela ${installment.installmentNumber}.`,
        );
        hasError = true;
        break;
      }

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
