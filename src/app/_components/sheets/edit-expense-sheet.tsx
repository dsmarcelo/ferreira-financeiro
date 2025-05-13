"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet";
import type { Expense } from "@/server/db/schema/expense-schema";
import EditExpenseForm from "../forms/edit-expense-form";
import { useMediaQuery } from "usehooks-ts";
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
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="cursor-pointer">
        {children}
      </SheetTrigger>
      <SheetContent
        side={isMobile ? "top" : "right"}
        className="w-full max-w-md"
      >
        <SheetHeader className="pb-0">
          <SheetTitle>Editar Despesa</SheetTitle>
          <SheetDescription aria-hidden />
        </SheetHeader>
        <div className="overflow-y-auto p-4 pt-0">
          <EditExpenseForm expense={expense} onSuccess={() => setOpen(false)} />
        </div>
        <SheetClose ref={closeRef} className="sr-only">
          Fechar
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
