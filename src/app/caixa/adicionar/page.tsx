import SubPageHeader from "@/app/_components/sub-page-header";
import AddIncomeForm from "@/app/_components/forms/add-income-form";

export default function AddIncomePage() {
  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4">
      <SubPageHeader title="Adicionar Entrada" />
      <AddIncomeForm />
    </div>
  );
}