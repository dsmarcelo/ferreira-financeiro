"use client";

import { useActionState, useEffect, useState, useTransition, useRef, useCallback } from "react";
import {
  actionUpdateExpense,
  type ActionResponse,
  actionDeleteExpense,
} from "@/actions/expense-actions";
import type { Expense } from "@/server/db/schema/expense-schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldError } from "../forms/field-error";
import CurrencyInput from "@/components/inputs/currency-input";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";
import { useRouter } from "next/navigation";
import { getInstallmentsByGroupId, getExpenseById } from "@/server/queries/expense-queries";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TrashIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelector } from "@/app/_components/inputs/category-selector";

const initialState: ActionResponse = {
  success: false,
  message: "",
};

type EditExpenseFormProps = {
  expense: Expense;
  onSuccess?: () => void;
  onClose?: () => void;
};

function SingleInstallmentEditForm({ installment, onSuccess, onClose }: {
  installment: Expense;
  onSuccess?: () => void;
  onClose?: () => void;
}) {
  // Use a local state to track if this form has been submitted successfully
  // This prevents multiple submissions and callbacks
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateExpense,
    initialState,
  );

  // Custom form action wrapper to prevent multiple submissions
  const handleFormAction = useCallback(
    (formData: FormData) => {
      if (hasSubmitted) {
        // If already submitted, don't submit again
        return;
      }
      // Return the original formAction call
      return formAction(formData);
    },
    [formAction, hasSubmitted]
  );

  // Modified to avoid duplicate toasts and prevent infinite loops
  useEffect(() => {
    if (state.success && !hasSubmitted) {
      // Show a toast only for this specific installment
      toast.success(`Parcela ${installment.installmentNumber}/${installment.totalInstallments} atualizada`);
      // Mark as submitted before calling callbacks to prevent loops
      setHasSubmitted(true);
      // Only call callbacks once
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } else if (state.message && !state.success && state.errors) {
      // Show error inline only, no toast
    }
  }, [state, onSuccess, onClose, hasSubmitted, installment.installmentNumber, installment.totalInstallments]);

  return (
    <form action={handleFormAction} className="mt-2 p-3 border rounded-md bg-slate-50">
      <input type="hidden" name="id" value={installment.id} />
      <input type="hidden" name="type" value={installment.type} />
      {installment.source && <input type="hidden" name="source" value={installment.source} />}
      <p className="text-sm font-medium mb-2">
        Parcela {installment.installmentNumber}/{installment.totalInstallments}
      </p>

      <div className="mb-2 flex flex-col gap-2">
        <Label htmlFor={`description-${installment.id}`}>Descrição</Label>
        <Input
          id={`description-${installment.id}`}
          name="description"
          defaultValue={installment.description}
          required
        />
        {state.errors?.description && <FieldError messages={state.errors.description} />}
      </div>

      <div className="mb-2 flex flex-col gap-2">
        <Label htmlFor={`value-${installment.id}`}>Valor</Label>
        <CurrencyInput
          name="value"
          initialValue={Number(installment.value)}
          required
        />
        {state.errors?.value && <FieldError messages={state.errors.value} />}
      </div>

      <div className="mb-2 flex flex-col gap-2">
        <Label htmlFor={`date-${installment.id}`}>Data</Label>
        <DatePicker
          name="date"
          defaultValue={installment.date}
          required
        />
        {state.errors?.date && <FieldError messages={state.errors.date} />}
      </div>

      <div className="flex items-center space-x-2 mb-3">
        <Checkbox
          id={`isPaid-${installment.id}`}
          name="isPaid"
          defaultChecked={installment.isPaid}
        />
        <Label htmlFor={`isPaid-${installment.id}`}>Pago?</Label>
      </div>
      {state.errors?.isPaid && <FieldError messages={state.errors.isPaid} />}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando Parcela..." : "Salvar Parcela"}
      </Button>
    </form>
  );
}

export default function EditExpenseForm({
  expense,
  onSuccess,
  onClose,
}: EditExpenseFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateExpense,
    initialState,
  );
  const [_deleteState, deleteFormAction, deletePending] = useActionState<ActionResponse, FormData>(
    actionDeleteExpense,
    initialState,
  );

  const [isDeletingTransition, startDeleteTransition] = useTransition();

  // State for dynamic visibility of recurrenceInterval input
  const [currentRecurrenceType, setCurrentRecurrenceType] = useState(expense.recurrenceType ?? "");
  const [formDate, setFormDate] = useState<string>(expense.date);

  const [relatedInstallments, setRelatedInstallments] = useState<Expense[]>([]);
  const [isLoadingInstallments, setIsLoadingInstallments] = useState(false);

  useEffect(() => {
    setCurrentRecurrenceType(expense.recurrenceType ?? "");
  }, [expense.recurrenceType]);

  useEffect(() => {
    const currentInstanceDate = expense.date; // The date of the 'expense' prop item

    const setFormDateToOriginalSeriesStart = (seriesParentExpense: Expense | undefined) => {
      if (seriesParentExpense?.date) {
        setFormDate(seriesParentExpense.date);
      } else {
        // Fallback to the current item's date if parent/original info is missing
        setFormDate(currentInstanceDate);
      }
    };

    const handleErrorFetchingOriginalDate = () => {
      console.error("Failed to fetch original recurring expense details.");
      toast.error("Falha ao buscar data original da despesa recorrente.");
      setFormDate(currentInstanceDate); // Fallback to current item's date
    };

    if (expense.type === "recurring_occurrence" && expense.originalRecurringExpenseId) {
      // This is a paid, materialized occurrence. Fetch its original parent series.
      getExpenseById(expense.originalRecurringExpenseId)
        .then(setFormDateToOriginalSeriesStart)
        .catch(handleErrorFetchingOriginalDate);
    } else if (expense.type === "recurring" && expense.id != null) {
      // This is either the parent recurring definition itself or an unpaid generated instance.
      // In both cases, expense.id refers to the parent recurring series definition.
      // Fetching by expense.id gives us the definitive series record, and its 'date' is the series start date.
      getExpenseById(expense.id)
        .then(setFormDateToOriginalSeriesStart)
        .catch(handleErrorFetchingOriginalDate);
    } else {
      // For one_time, installment, or other types, use their own date.
      setFormDate(currentInstanceDate);
    }
  }, [expense.type, expense.id, expense.originalRecurringExpenseId, expense.date]);

  // Use a ref to track if we've already fetched installments to prevent infinite loops
  const hasLoadedInstallments = useRef<boolean>(false);

  useEffect(() => {
    // Only fetch installments once per component mount
    if (expense.type === "installment" && expense.groupId && !hasLoadedInstallments.current) {
      hasLoadedInstallments.current = true;
      setIsLoadingInstallments(true);
      getInstallmentsByGroupId(expense.groupId)
        .then((installments) => {
          setRelatedInstallments(installments.filter(inst => inst.id !== expense.id));
        })
        .catch((err) => {
          console.error("Failed to fetch related installments:", err);
          toast.error("Falha ao buscar parcelas relacionadas.");
        })
        .finally(() => {
          setIsLoadingInstallments(false);
        });
    }
  }, [expense.id, expense.type, expense.groupId]);

  // Track if we've already handled a successful update to prevent multiple callbacks
  const hasHandledSuccess = useRef<boolean>(false);

  useEffect(() => {
    // Skip if we've already handled this success
    if (state.success && !hasHandledSuccess.current) {
      // Mark as handled to prevent multiple callbacks
      hasHandledSuccess.current = true;

      // Show success toast
      toast.success(state.message);

      // Call callbacks
      if (onSuccess) onSuccess();
      if (onClose) onClose();

      // If the main expense was updated and it's an installment, refresh related installments
      // But only do this if we're in a modal/sheet context (onClose exists)
      // This prevents infinite loops in the standalone edit page
      if (expense.type === "installment" && expense.groupId && onClose) {
        setIsLoadingInstallments(true);
        // Use void to properly handle the promise
        void getInstallmentsByGroupId(expense.groupId)
          .then((installments) => {
            setRelatedInstallments(installments.filter(inst => inst.id !== expense.id));
          })
          .catch((err) => {
            console.error("Failed to re-fetch related installments:", err);
            toast.error("Falha ao re-buscar parcelas relacionadas.");
          })
          .finally(() => {
            setIsLoadingInstallments(false);
          });
      }
    } else if (state.message && !state.success && state.errors) {
      toast.error(state.message);
    }
  }, [state, onSuccess, onClose, expense.id, expense.type, expense.groupId]);

  useEffect(() => {
    if (_deleteState.success) {
      toast.success(_deleteState.message);
      if (onSuccess) onSuccess();
      if (onClose) {
        onClose();
      } else {
        router.back(); // Fallback to router.back if not in a sheet context
      }
    } else if (_deleteState.message && !_deleteState.success) { // Check for message to avoid toast on initial state
      toast.error(_deleteState.message ?? "Erro ao deletar despesa.");
    }
  }, [_deleteState, onSuccess, router, onClose]); // Added onClose to dependencies

  const handleDelete = async () => {
    if (!expense.id) return;
    if (!window.confirm("Tem certeza que deseja excluir esta despesa?")) return;
    const formData = new FormData();
    formData.append("id", expense.id.toString());

    startDeleteTransition(() => {
      deleteFormAction(formData);
    });
  };

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4 p-4 border rounded-lg shadow-sm bg-white">
        <input type="hidden" name="id" value={expense.id} />
        <input type="hidden" name="type" value={expense.type} />
        {expense.source && <input type="hidden" name="source" value={expense.source} />}

        {expense.type === "installment" && (
          <p className="text-sm text-gray-600">
            Parcela {expense.installmentNumber} de {expense.totalInstallments}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            name="description"
            defaultValue={expense.description}
            required
          />
          {state.errors?.description && <FieldError messages={state.errors.description} />}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="value">Valor</Label>
          <CurrencyInput
            id="value"
            name="value"
            initialValue={Number(expense.value)}
            required
          />
          {state.errors?.value && <FieldError messages={state.errors.value} />}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Data</Label>
          <DatePicker
            name="date"
            defaultValue={formDate}
            required
          />
          {state.errors?.date && <FieldError messages={state.errors.date} />}
        </div>

                <div className="flex items-center space-x-2">
          <Checkbox
            id="isPaid"
            name="isPaid"
            defaultChecked={expense.isPaid}
          />
          <Label htmlFor="isPaid">Pago?</Label>
        </div>
        {state.errors?.isPaid && <FieldError messages={state.errors.isPaid} />}

        <div className="flex flex-col gap-2">
          <Label htmlFor="categoryId">Categoria</Label>
          <CategorySelector
            name="categoryId"
            defaultValue={expense.category?.id}
            required
          />
          {state.errors?.categoryId && <FieldError messages={state.errors.categoryId} />}
        </div>

        {/* Recurrence Fields - only for recurring expenses */}
        {expense.type === "recurring" && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="recurrenceType">Frequência da Recorrência</Label>
              <Select
                name="recurrenceType"
                defaultValue={expense.recurrenceType ?? undefined}
                onValueChange={setCurrentRecurrenceType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                  <SelectItem value="custom_days">Dias Personalizados</SelectItem>
                </SelectContent>
              </Select>
              {state.errors?.recurrenceType && <FieldError messages={state.errors.recurrenceType} />}
            </div>

            {currentRecurrenceType === "custom_days" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="recurrenceInterval">Intervalo de Dias (Recorrência)</Label>
                <Input
                  id="recurrenceInterval"
                  name="recurrenceInterval"
                  type="number"
                  defaultValue={expense.recurrenceInterval ?? undefined}
                  placeholder="Ex: 7 (para a cada 7 dias)"
                />
                {state.errors?.recurrenceInterval && <FieldError messages={state.errors.recurrenceInterval} />}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="recurrenceEndDate">Data Final da Recorrência (Opcional)</Label>
              <DatePicker
                name="recurrenceEndDate"
                defaultValue={expense.recurrenceEndDate ?? undefined}
              />
              {state.errors?.recurrenceEndDate && <FieldError messages={state.errors.recurrenceEndDate} />}
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePending || pending || isDeletingTransition}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onClose) {
                onClose();
              } else { // TODO: go back in the router history or this \/
                let targetUrl = "/"; // Default fallback
                switch (expense.source) {
                  case "product_purchase":
                    targetUrl = "/compras-produtos";
                    break;
                  case "personal":
                    targetUrl = "/despesas-pessoais";
                    break;
                  case "store":
                    targetUrl = "/despesas-loja";
                    break;
                }
                router.push(targetUrl);
              }
            }}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Salvando..." : "Salvar Alterações"}
          </Button>

        </div>
        {state.message && !state.success && (
          <p className="text-sm text-red-600">Erro: {state.message}</p>
        )}
      </form>

      {expense.type === "installment" && expense.groupId && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Outras Parcelas do Grupo</h3>
          {isLoadingInstallments && <p>Carregando outras parcelas...</p>}
          {!isLoadingInstallments && relatedInstallments.length === 0 && (
            <p>Nenhuma outra parcela encontrada para este grupo.</p>
          )}
          <div className="space-y-4">
            {relatedInstallments.map((inst) => (
              <SingleInstallmentEditForm
                key={inst.id}
                installment={inst}
                onSuccess={() => {
                  if (expense.groupId) {
                    getInstallmentsByGroupId(expense.groupId)
                      .then((installments) => {
                        setRelatedInstallments(installments.filter(ins => ins.id !== expense.id));
                        if (onSuccess) onSuccess();
                      })
                      .catch((err) => {
                        console.error("Failed to re-fetch related installments after sub-edit:", err);
                        toast.error("Falha ao atualizar lista de parcelas.");
                      });
                  }
                }}
                onClose={onClose} // Pass onClose to sub-component
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
