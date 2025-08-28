"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import EditSaleForm from "@/app/_components/forms/edit-sale-form";
import type { Income as Sale } from "@/server/db/schema/incomes-schema";
import { actionDeleteSale } from "@/actions/sales-actions";
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

interface EditSaleSheetProps {
  sale: Sale;
  children: React.ReactNode;
}

export default function EditSaleSheet({ sale, children }: EditSaleSheetProps) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (!sale.id) return;
    if (!window.confirm("Tem certeza que deseja excluir esta venda?")) return;

    try {
      await actionDeleteSale(sale.id);
      toast.success("Venda excluída com sucesso!");
      setOpen(false);
    } catch (error) {
      toast.error("Erro ao excluir venda");
      console.error("Error deleting sale:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Venda</DialogTitle>
          <DialogDescription className="hidden" aria-hidden="true" />
        </DialogHeader>
        <div className="py-4">
          <EditSaleForm id="edit-sale-form" income={sale} onSuccess={() => setOpen(false)} />
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" size="icon" onClick={handleDelete}>
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

