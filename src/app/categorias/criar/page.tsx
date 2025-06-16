import { CreateCategoryForm } from "@/app/_components/forms/create-category-form";
import SubPageHeader from "@/app/_components/sub-page-header";

export default function CreateCategoryPage() {
  return (
    <div className="container mx-auto py-6">
      <SubPageHeader title="Nova Categoria" />
      <CreateCategoryForm />
    </div>
  );
}