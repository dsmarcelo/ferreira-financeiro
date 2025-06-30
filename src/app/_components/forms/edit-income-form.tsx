"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  actionDeleteIncome,
  actionUpdateIncome,
  type ActionResponse,
} from "@/actions/income-actions";
import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";
import type { Income } from "@/server/db/schema/incomes-schema";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";
import { TrashIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DeleteDialog } from "../dialogs/delete-dialog";

interface EditIncomeFormProps {
  id?: string;
  income: Income;
  onSuccess?: () => void;
  onClose?: () => void;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function EditIncomeForm({ id, income, onSuccess, onClose }: EditIncomeFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateIncome,
    initialState,
  );

  // Handle success/error toasts and navigation
  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
      if (onSuccess) {
        onSuccess();
      } else {
        router.back();
      }
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state, onSuccess, router]);

  // Parse error messages from ActionResponse
  const errors = state?.errors ?? {};

  const handleDelete = async () => {
    if (!income.id) return;
    if (!window.confirm("Tem certeza que deseja excluir esta receita?")) return;

    try {
      await actionDeleteIncome(income.id);
      toast.success("Receita excluída com sucesso!");
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    } catch (error) {
      toast.error("Erro ao excluir receita");
      console.error("Error deleting income:", error);
    }
  };

  return (
    <div className="space-y-4">
      <form id={id} action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={income.id} />

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            name="description"
            type="text"
            placeholder="Descrição da receita"
            defaultValue={income.description || ""}
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.description?.[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <DatePicker
            id="date"
            name="date"
            required
            defaultValue={
              income.dateTime
                ? new Date(income.dateTime).toLocaleDateString('en-CA', {
                    timeZone: 'America/Sao_Paulo'
                  })
                : ""
            }
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.date?.[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Hora</Label>
          <Input
            id="time"
            name="time"
            type="time"
            defaultValue={
              income.dateTime
                ? new Date(income.dateTime).toLocaleTimeString('pt-BR', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo'
                  })
                : "12:00"
            }
            className="rounded-md"
            required
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.time?.[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Valor</Label>
          <CurrencyInput
            id="value"
            name="value"
            step="0.01"
            min={0}
            required
            initialValue={Number(income.value)}
          />
          {errors.value && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.value[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
          <Input
            id="profitMargin"
            name="profitMargin"
            type="number"
            inputMode="numeric"
            step="0.01"
            min={0}
            max={100}
            defaultValue={Number(income.profitMargin)}
            required
          />
          {errors.profitMargin && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.profitMargin[0]}
            </p>
          )}
        </div>

        {!id && (
          <div className="w-full flex justify-between gap-2 pt-2">
            <DeleteDialog
              onConfirm={handleDelete}
              triggerText={<TrashIcon className="h-4 w-4 text-red-500" />}
            />

            <Button type="submit" disabled={pending} className="">
              {pending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        )}

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