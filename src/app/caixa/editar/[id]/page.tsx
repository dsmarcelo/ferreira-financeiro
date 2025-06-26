"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getIncomeById } from "@/server/queries/income-queries";
import EditIncomeForm from "@/app/_components/forms/edit-income-form";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Income } from "@/server/db/schema/incomes-schema";
import SubPageHeader from "@/app/_components/sub-page-header";

export default function EditIncomePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [income, setIncome] = useState<Income | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        if (isNaN(id)) {
          toast.error("ID da receita inválido");
          router.push("/");
          return;
        }

        const fetchedIncome = await getIncomeById(id);

        if (!fetchedIncome) {
          toast.error("Receita não encontrada");
          router.push("/");
          return;
        }

        setIncome(fetchedIncome);
      } catch (error) {
        console.error("Error fetching income:", error);
        toast.error("Erro ao buscar receita");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    void fetchIncome();
  }, [params, router]);

  const handleSuccess = () => {
    toast.success("Receita atualizada com sucesso!");
    router.push("/");
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

    if (!income) {
      return <p className="text-center">Receita não encontrada</p>;
    }

    return (
      <EditIncomeForm
        income={income}
        onSuccess={handleSuccess}
        onClose={() => router.push("/")}
      />
    );
  };

  return (
    <div className="">
      <SubPageHeader title="Editar Entrada" />
      <div className="mx-auto mt-4 container max-w-3xl px-5">
        {renderContent()}
      </div>
    </div>
  );
}
