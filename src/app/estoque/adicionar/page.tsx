import SubPageHeader from "@/app/_components/sub-page-header";
import AddProductForm from "@/app/_components/forms/add-product-form";

export default function AddProductPage() {
  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4">
      <SubPageHeader title="Adicionar Produto" />
      <AddProductForm />
    </div>
  );
}


