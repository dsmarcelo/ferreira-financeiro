import { notFound } from "next/navigation";
import { getExpenseById } from "@/server/queries/expense-queries";
import EditExpenseForm from "@/app/_components/forms/edit-expense-form";
import SubPageHeader from "@/app/_components/sub-page-header";

interface EditExpensePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExpensePage({
  params,
}: EditExpensePageProps) {
  const { id } = await params;
  if (!id) return notFound();
  const expense = await getExpenseById(Number(id));
  if (!expense) return notFound();

  return (
    <main className="mx-auto max-w-2xl">
      <SubPageHeader title="Editar Despesa" prevURL="/compras-produtos" />
      <div className="p-4">
        <EditExpenseForm expense={expense} />
      </div>
    </main>
  );
}
