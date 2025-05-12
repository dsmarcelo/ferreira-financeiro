"use client";

import { useRef, useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import type { Expense } from "@/server/db/schema/expense";
import EditExpenseForm from "../forms/edit-expense-form";

interface EditExpenseSheetProps {
  expense: Expense;
  children: React.ReactNode;
}

export default function EditExpenseSheet({
  expense,
  children,
}: EditExpenseSheetProps) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>Editar Despesa</SheetTitle>
        </SheetHeader>
        <div className="px-4">
          <EditExpenseForm expense={expense} onSuccess={() => setOpen(false)} />
        </div>
        <SheetClose ref={closeRef} className="sr-only">
          Fechar
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
