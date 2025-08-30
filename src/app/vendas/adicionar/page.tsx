import SubPageHeader from "@/app/_components/sub-page-header";
import AddSaleForm from "@/app/_components/forms/add-sale-form";

export default function AddSalesPage() {
  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4">
      <SubPageHeader title="Adicionar Venda" />
      <AddSaleForm />
    </div>
  );
}


