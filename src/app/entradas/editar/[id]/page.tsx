import { getIncomeById } from "@/server/queries/income-queries";
import SubPageHeader from "@/app/_components/sub-page-header";
import EditIncomeForm from "@/app/_components/forms/edit-income-form";
import { Skeleton } from "@/components/ui/skeleton";
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
  const resolved = await params;
  const idNum = Number(resolved.id);
  if (!Number.isFinite(idNum)) {
    return <p className="text-center text-4xl font-bold mt-12">Receita não encontrada</p>;
  }

  const income = (await getIncomeById(idNum)) as Income | undefined;
  if (!income) {
    return <p className="text-center text-4xl font-bold mt-12">Receita não encontrada</p>;
  }

  return (
    <div className="">
      <SubPageHeader title="Editar Entrada" />
      <div className="mx-auto mt-4 container max-w-3xl px-5">
        <Suspense fallback={<LoadingSkeleton />}>
          <EditIncomeForm income={income} />
        </Suspense>
      </div>
    </div>
  );
}


