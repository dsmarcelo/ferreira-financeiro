"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type Expense } from "@/server/db/schema/expense-schema";
import { actionUpdateExpense, type ActionResponse } from "@/actions/expense-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/inputs/date-picker";
import CurrencyInput from "@/components/inputs/currency-input";
import { FieldError } from "../forms/field-error";

interface EditOccurrenceFormProps {
  occurrenceExpense: Expense; // This will be of type 'recurring_occurrence'
  onSuccess?: () => void;
  onClose?: () => void;
  onEditOriginal: (originalExpenseId: number) => void;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
  errors: undefined,
};

export default function EditOccurrenceForm({
  occurrenceExpense,
  onSuccess,
  onClose,
  onEditOriginal,
}: EditOccurrenceFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateExpense,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      if (onSuccess) onSuccess();
      if (onClose) onClose(); // Close on successful save of occurrence
    } else if (state.message && !state.success && state.errors) {
      toast.error(state.message);
    }
  }, [state, onSuccess, onClose, router]);

  if (!occurrenceExpense.originalRecurringExpenseId) {
    return (
      <div className="p-4 text-red-600">
        Erro: Esta despesa de ocorrência não possui um ID de despesa recorrente original vinculado.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={occurrenceExpense.id} />
        {/* Type and source should not be changed for an occurrence, send them to satisfy action */} 
        <input type="hidden" name="type" value={occurrenceExpense.type} /> 
        {occurrenceExpense.source && <input type="hidden" name="source" value={occurrenceExpense.source} />} 
<input type="hidden" name="originalRecurringExpenseId" value={occurrenceExpense.originalRecurringExpenseId} />

        <p className="text-sm text-gray-600">
          Você está editando uma ocorrência específica de uma despesa recorrente. 
          As alterações aqui afetarão apenas esta ocorrência.
        </p>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Input 
            id="description"
            name="description" 
            defaultValue={occurrenceExpense.description} 
            required 
          />
          {state.errors?.description && <FieldError messages={state.errors.description} />}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="value">Valor</Label>
          <CurrencyInput 
            name="value" 
            initialValue={Number(occurrenceExpense.value)} 
            required 
          />
          {state.errors?.value && <FieldError messages={state.errors.value} />}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Data</Label>
          <DatePicker 
            name="date" 
            defaultValue={occurrenceExpense.date} 
            required 
          />
          {state.errors?.date && <FieldError messages={state.errors.date} />}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isPaid"
            name="isPaid" 
            defaultChecked={occurrenceExpense.isPaid} 
          />
          <Label htmlFor="isPaid">Pago?</Label>
        </div>
        {state.errors?.isPaid && <FieldError messages={state.errors.isPaid} />}

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Salvando Ocorrência..." : "Salvar Ocorrência"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            className="w-full sm:w-auto"
            disabled={pending}
          >
            Cancelar
          </Button>
        </div>
      </form>

      <div className="pt-4 border-t">
        <Button 
          variant="secondary"
          onClick={() => onEditOriginal(occurrenceExpense.originalRecurringExpenseId!)} 
          className="w-full"
        >
          Editar Despesa Recorrente Original
        </Button>
      </div>
    </div>
  );
}
