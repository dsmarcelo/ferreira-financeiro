import { CreateCategoryForm } from "@/app/_components/forms/create-category-form";
import SubPageHeader from "@/app/_components/sub-page-header";

export default function CreateCategoryPage() {
  return (
    <div className="container mx-auto">
      <SubPageHeader title="Nova Categoria" className="mb-4" />
      <CreateCategoryForm />
    </div>
  );
}