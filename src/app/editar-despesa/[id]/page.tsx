"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getExpenseById } from "@/server/queries/expense-queries";
import EditExpenseForm from "@/app/_components/forms/edit-expense-form";
import EditOccurrenceForm from "@/app/_components/forms/edit-occurrence-form";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Expense } from "@/server/db/schema/expense-schema";
import SubPageHeader from "@/app/_components/sub-page-header";
import Header from "@/app/_components/header";

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenseURL, setExpenseURL] = useState<string>("");
  const [originalExpense, setOriginalExpense] = useState<Expense | null>(null);
  // Add a ref to track if we've already handled a successful update
  // This prevents multiple redirects and infinite loops
  const hasHandledSuccess = useRef<boolean>(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const id = parseInt((await params).id, 10);
        if (isNaN(id)) {
          toast.error("ID de despesa inválido");
          router.push("/");
          return;
        }

        const expenseData = await getExpenseById(id);
        if (!expenseData) {
          toast.error("Despesa não encontrada");
          router.push("/");
          return;
        }

        switch (expenseData.source) {
          case "personal":
            setExpenseURL("/despesas-pessoais");
            break;
          case "store":
            setExpenseURL("/despesas-loja");
            break;
          case "product_purchase":
            setExpenseURL("/compras-produtos");
            break;
          default:
            setExpenseURL("/");
          }

        setExpense(expenseData);
      } catch (error) {
        console.error("Error fetching expense:", error);
        toast.error("Erro ao carregar despesa");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    // Handle the promise properly
    void fetchExpense();
  }, [params, router]);

  const handleEditOriginal = async (originalId: number) => {
    try {
      const originalExpenseData = await getExpenseById(originalId);
      if (originalExpenseData) {
        setOriginalExpense(originalExpenseData);
      } else {
        toast.error("Despesa recorrente original não encontrada");
      }
    } catch (error) {
      console.error("Error fetching original expense:", error);
      toast.error("Erro ao buscar despesa recorrente original");
    }
  };

  const handleSuccess = () => {
    if (!expense || hasHandledSuccess.current) return;

    // Mark as handled to prevent multiple success handlers
    hasHandledSuccess.current = true;

    // Show success message without redirecting
    toast.success("Despesa atualizada com sucesso!");

    // For other expense types, redirect after a short delay to ensure state updates complete
    setTimeout(() => {
    //   if (router.back) {
    //     router.back();
    //     return;
    //   }
      router.push(expenseURL);
    }, 500); // Short delay to ensure all state updates complete
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="border rounded-lg p-6 shadow-sm">
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    if (!expense) {
      return <p className="text-center">Despesa não encontrada</p>;
    }

    // If we're viewing an original recurring expense after clicking from an occurrence
    if (originalExpense) {
      return (
        <EditExpenseForm
          expense={originalExpense}
          onSuccess={handleSuccess}
        />
      );
    }

    // Choose the appropriate form based on expense type
    if (expense.type === "recurring_occurrence") {
      return (
        <EditOccurrenceForm
          occurrenceExpense={expense}
          onSuccess={handleSuccess}
          onEditOriginal={handleEditOriginal}
        />
      );
    }

    return (
      <EditExpenseForm
        expense={expense}
        onSuccess={handleSuccess}
      />
    );
  };

  const getPageTitle = () => {
    if (loading || !expense) return "Editar Despesa";

    if (originalExpense) {
      return "Editar Despesa Recorrente Original";
    }

    if (expense.type === "recurring_occurrence") {
      return "Editar Ocorrência de Despesa";
    }

    if (expense.type === "recurring") {
      return "Editar Despesa Recorrente";
    }

    if (expense.type === "installment") {
      return `Editar Parcela ${expense.installmentNumber}/${expense.totalInstallments}`;
    }

    return "Editar Despesa";
  };

  return (
    <div className="">
      <SubPageHeader prevURL={expenseURL} title={getPageTitle()} />
      <div className="mx-auto mt-4 container px-4">
        {renderContent()}
      </div>
    </div>
  );
}
