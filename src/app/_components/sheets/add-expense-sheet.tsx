"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import AddExpenseForm from "@/app/_components/forms/add-expense-form";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";

export default function AddExpenseSheet({
  source,
}: {
  source: ExpenseInsert["source"];
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent className="w-[1200px]">
        <SheetHeader className="pb-0">
          <SheetTitle>Adicionar Despesa</SheetTitle>
          <SheetDescription aria-hidden="true" />
        </SheetHeader>
        <AddExpenseForm source={source} onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
