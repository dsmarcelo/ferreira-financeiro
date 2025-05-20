"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getExpenseById } from "@/server/queries/expense-queries";
import EditExpenseForm from "@/app/_components/forms/edit-expense-form";
import EditOccurrenceForm from "@/app/_components/forms/edit-occurrence-form";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Expense } from "@/server/db/schema/expense-schema";

export default function EditExpensePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [originalExpense, setOriginalExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const id = parseInt(params.id, 10);
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
  }, [params.id, router]);

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
    if (!expense) return;
    
    // Redirect based on expense source
    switch (expense.source) {
      case "personal":
        router.push("/despesas-pessoais");
        break;
      case "store":
        router.push("/despesas-loja");
        break;
      case "product_purchase":
        router.push("/compras-produtos");
        break;
      default:
        router.push("/");
    }
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
    <div className="container max-w-2xl py-6">
      <h1 className="text-2xl font-bold mb-4">{getPageTitle()}</h1>
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
}
