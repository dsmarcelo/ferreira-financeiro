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
        const fetchedIncome = await getIncomeById(incomeId);

        return fetchedIncome ?? null;
      } catch (error) {
        console.error("Error fetching income:", error);
        return null;
      }
  };

  const income = await fetchIncome();

  if (!income) {
    return <p className="text-center text-4xl font-bold mt-12">Receita não encontrada</p>;
  }

  return (
    <div className="">
      <SubPageHeader title="Editar Entrada" />
      <div className="mx-auto mt-4 container max-w-3xl px-5">
        <Suspense fallback={<LoadingSkeleton />}>
          <EditIncomeForm
            income={income}
          />
        </Suspense>
      </div>
    </div>
  );
}
