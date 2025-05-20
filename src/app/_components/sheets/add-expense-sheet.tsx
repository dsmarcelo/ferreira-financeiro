"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AddExpenseForm from "@/app/_components/forms/add-expense-form";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";
// import {
//   Sheet,
//   SheetClose,
//   SheetContent,
//   SheetDescription,
//   SheetFooter,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
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

export default function AddExpenseSheet({
  source,
  buttonLabel,
  children,
}: {
  source: ExpenseInsert["source"];
  buttonLabel: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button className="rounded-full">{buttonLabel}</Button>}
      </DialogTrigger>
      <DialogContent className="flex h-[90dvh] max-h-[600px] max-w-[90dvw] min-w-[700px] flex-col">
        <DialogHeader className="pb-0">
          <DialogTitle>Adicionar Despesa</DialogTitle>
          <DialogDescription className="hidden" aria-hidden="true" />
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <AddExpenseForm
            id="add-expense-form"
            source={source}
            onSuccess={() => setOpen(false)}
          />
        </div>
        <DialogFooter className="border-t pt-4">
          <Button type="submit" form="add-expense-form">
            Adicionar
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
