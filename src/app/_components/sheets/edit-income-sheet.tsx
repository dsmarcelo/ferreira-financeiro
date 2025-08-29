"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import EditSaleForm from "@/app/_components/forms/edit-sale-form";
import type { Income } from "@/server/db/schema/incomes-schema";
import { actionDeleteIncome } from "@/actions/income-actions";
import { toast } from "sonner";
import { TrashIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EditIncomeSheetProps {
  income: Income;
  children: React.ReactNode;
}

export default function EditIncomeSheet({
  income,
  children,
}: EditIncomeSheetProps) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (!income.id) return;
    if (!window.confirm("Tem certeza que deseja excluir esta receita?")) return;

    try {
      await actionDeleteIncome(income.id);
      toast.success("Receita excluída com sucesso!");
      setOpen(false);
    } catch (error) {
      toast.error("Erro ao excluir receita");
      console.error("Error deleting income:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Entrada</DialogTitle>
          <DialogDescription className="hidden" aria-hidden="true" />
        </DialogHeader>
        <div className="py-4">
          <EditSaleForm
            id="edit-sale-form"
            income={income}
            onSuccess={() => setOpen(false)}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleDelete}
          >
            <TrashIcon className="h-4 w-4 text-red-500" />
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" form="edit-sale-form">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
