import { notFound } from "next/navigation";
import { getExpenseById } from "@/server/queries/expense-queries";
import EditExpenseForm from "@/app/_components/forms/edit-expense-form";
import SubPageHeader from "@/app/_components/sub-page-header";

interface EditExpensePageProps {
  params: { id: string };
}

export default async function EditExpensePage({
  params,
}: EditExpensePageProps) {
  const id = Number(params.id);
  if (!id) return notFound();
  const expense = await getExpenseById(id);
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
