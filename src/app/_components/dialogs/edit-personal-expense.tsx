"use client";

import { useActionState, useState, useEffect } from "react";
import {
  actionDeletePersonalExpense,
  actionUpdatePersonalExpense,
  type ActionResponse,
} from "@/actions/personal-expense-actions";
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
import type { PersonalExpense } from "@/server/db/schema/personal-expense";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "./delete-dialog";
import { toast } from "sonner";
import { DatePicker } from "@/components/inputs/date-picker";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface EditPersonalExpenseProps {
  data: PersonalExpense;
  className?: string;
  children: React.ReactNode;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function EditPersonalExpense({
  data,
  children,
}: EditPersonalExpenseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionUpdatePersonalExpense,
    initialState,
  );

  // Handle success/error toasts and dialog state
  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
      setIsOpen(false);
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  // Parse error messages from ActionResponse
  const errors = state?.errors ?? {};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Despesa Pessoal</DialogTitle>
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
            <DatePicker
              id="date"
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

          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="isPaid">Pago</Label>
              <Switch
                id="isPaid"
                name="isPaid"
                defaultChecked={data.isPaid}
              />
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <DeleteDialog
              onConfirm={() => {
                void actionDeletePersonalExpense(data.id);
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
