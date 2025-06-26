import { redirect } from "next/navigation";
import { getIncomeById } from "@/server/queries/income-queries";
import EditIncomeForm from "@/app/_components/forms/edit-income-form";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import SubPageHeader from "@/app/_components/sub-page-header";
import { Suspense } from "react";
import type { Income } from "@/server/db/schema/incomes-schema";

function LoadingSkeleton() {
  return (
    <div className="border rounded-lg p-6 shadow-sm">
      <Skeleton className="h-8 w-full mb-4" />
      <Skeleton className="h-8 w-full mb-4" />
      <Skeleton className="h-8 w-full mb-4" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export default async function EditIncomePage({ params }: { params: Promise<{ id: string }> }) {
    const fetchIncome = async (): Promise<Income | null> => {
      try {
        const resolvedParams = await params;
        const incomeId = parseInt(resolvedParams.id);

        if (isNaN(incomeId)) {
          toast.error("ID da receita inválido");
          redirect("/");
          return null;
        }

        const fetchedIncome = await getIncomeById(incomeId);

        if (!fetchedIncome) {
          toast.error("Receita não encontrada");
          redirect("/");
          return null;
        }

        return fetchedIncome;
      } catch (error) {
        console.error("Error fetching income:", error);
        toast.error("Erro ao buscar receita");
        redirect("/");
      }
  };

  const handleSuccess = () => {
    toast.success("Receita atualizada com sucesso!");
    redirect("/");
  };

  const income = await fetchIncome();

  if (!income) {
    return <p className="text-center">Receita não encontrada</p>;
  }

  return (
    <div className="">
      <SubPageHeader title="Editar Entrada" />
      <div className="mx-auto mt-4 container max-w-3xl px-5">
        <Suspense fallback={<LoadingSkeleton />}>
      <EditIncomeForm
        income={income}
        // onSuccess={handleSuccess}
        // onClose={() => redirect("/")}
      />
      </Suspense>
      </div>
    </div>
  );
}
