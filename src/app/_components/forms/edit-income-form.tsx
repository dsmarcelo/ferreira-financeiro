"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  actionUpdateIncome,
  actionDeleteIncome,
  type ActionResponse,
} from "@/actions/income-actions";
import type { Income } from "@/server/db/schema/incomes-schema";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DeleteDialog } from "../dialogs/delete-dialog";
import { useIncomeData } from "@/hooks/use-income-data";
import { IncomeBasicFields } from "./income/income-basic-fields";
// Sales-related components removed for incomes

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

export default function EditIncomeForm({
  id,
  income,
  onSuccess,
  onClose,
}: EditIncomeFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdateIncome,
    initialState,
  );

  const { customers, createCustomer } = useIncomeData();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Local form fields initialized from income
  const [description, setDescription] = useState<string>(
    income.description ?? "",
  );
  const [dateStr, setDateStr] = useState<string>(
    income.dateTime
      ? new Date(income.dateTime).toLocaleDateString("en-CA", {
          timeZone: "America/Sao_Paulo",
        })
      : "",
  );
  const [timeStr, setTimeStr] = useState<string>(
    income.dateTime
      ? new Date(income.dateTime).toLocaleTimeString("pt-BR", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        })
      : "12:00",
  );

  const [profitMargin, setProfitMargin] = useState<number | undefined>(
    income.profitMargin ? Number(income.profitMargin) : undefined,
  );

  // Total value (editable numeric field)
  const [totalValue, setTotalValue] = useState<number | undefined>(
    income.value ? Number(income.value) : undefined,
  );

  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
      if (onSuccess) onSuccess();
      else router.back();
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state.success, state.message, onSuccess, router]);

  const errors = state?.errors ?? {};

  const handleDelete = async () => {
    if (!income.id) return;
    try {
      await actionDeleteIncome(income.id);
      toast.success("Receita excluída com sucesso!");
      if (onClose) onClose();
      else router.back();
    } catch (error) {
      toast.error("Erro ao excluir receita");
      console.error("Error deleting income:", error);
    }
  };

  return (
    <div className="space-y-4">
      <form id={id} action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={income.id} />

        <IncomeBasicFields
          description={description}
          dateStr={dateStr}
          timeStr={timeStr}
          totalValue={totalValue}
          profitMargin={profitMargin}
          onDescriptionChange={setDescription}
          onDateChange={setDateStr}
          onTimeChange={setTimeStr}
          onTotalValueChange={setTotalValue}
          onProfitMarginChange={setProfitMargin}
          errors={errors}
        />

        {/* SalesSummary and hidden fields removed; values are submitted by inputs themselves */}

        {!id && (
          <div className="flex w-full justify-between gap-2 pt-2">
            <DeleteDialog
              onConfirm={handleDelete}
              triggerText={<span>Excluir</span>}
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
