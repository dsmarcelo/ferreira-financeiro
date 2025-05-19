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
import EditOccurrenceForm from "../forms/edit-occurrence-form";
import { getExpenseById } from "@/server/queries/expense-queries";
import { useMediaQuery } from "usehooks-ts";
import { toast } from "sonner";

interface EditExpenseSheetProps {
  expense: Expense;
  children: React.ReactNode;
}

export default function EditExpenseSheet({
  expense,
  children,
}: EditExpenseSheetProps) {
  const [open, setOpen] = useState(false);
  const [currentExpenseToEdit, setCurrentExpenseToEdit] = useState<Expense>(expense);
  const [isLoadingOriginal, setIsLoadingOriginal] = useState(false);

  const closeRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (open) {
      setCurrentExpenseToEdit(expense);
    }
  }, [open, expense]);

  const handleEditOriginal = async (originalExpenseId: number) => {
    setIsLoadingOriginal(true);
    try {
      const originalExpense = await getExpenseById(originalExpenseId);
      if (originalExpense) {
        setCurrentExpenseToEdit(originalExpense);
      } else {
        toast.error("Despesa recorrente original não encontrada.");
        setOpen(false);
      }
    } catch (error) {
      toast.error("Erro ao buscar despesa recorrente original.");
      console.error("Error fetching original recurring expense:", error);
    }
    setIsLoadingOriginal(false);
  };

  const getSheetTitle = () => {
    if (currentExpenseToEdit.type === "recurring_occurrence") {
      return "Editar Ocorrência de Despesa";
    }
    if (currentExpenseToEdit.type === "recurring") {
      return "Editar Despesa Recorrente";
    }
    return "Editar Despesa";
  };

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
          <SheetTitle>{isLoadingOriginal ? "Carregando..." : getSheetTitle()}</SheetTitle>
          <SheetDescription aria-hidden />
        </SheetHeader>
        <div className="overflow-y-auto p-4 pt-0">
          {isLoadingOriginal ? (
            <div className="flex justify-center items-center h-40">Carregando dados da despesa original...</div>
          ) : currentExpenseToEdit.type === "recurring_occurrence" ? (
            <EditOccurrenceForm 
              occurrenceExpense={currentExpenseToEdit} 
              onSuccess={() => setOpen(false)} 
              onClose={() => setOpen(false)} 
              onEditOriginal={handleEditOriginal}
            />
          ) : (
            <EditExpenseForm 
              expense={currentExpenseToEdit} 
              onSuccess={() => setOpen(false)} 
              onClose={() => setOpen(false)} 
            />
          )}
        </div>
        <SheetClose ref={closeRef} className="sr-only">
          Fechar
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
