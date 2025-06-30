"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AddExpenseForm from "@/app/_components/forms/add-expense-form";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import { useIsMobile } from "@/hooks/use-mobile";

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

export default function AddExpenseDialog({
  source,
  buttonLabel,
  children,
}: {
  source: ExpenseInsert["source"];
  buttonLabel: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const title =
    source === "personal" ? "Adicionar Despesa Pessoal" : "Adicionar Despesa";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button className="rounded-full">{buttonLabel}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="hidden" aria-hidden="true" />
        </DialogHeader>
        <div className="py-4">
          <AddExpenseForm
            id="add-expense-form"
            source={source}
            onSuccess={() => setOpen(false)}
          />
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" form="add-expense-form">
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
