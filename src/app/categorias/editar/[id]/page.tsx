import { getExpenseCategoryById } from "@/server/queries/expense-category-queries";
import { EditCategoryForm } from "@/app/_components/forms/edit-category-form";
import SubPageHeader from "@/app/_components/sub-page-header";
import { notFound } from "next/navigation";

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) {
    notFound();
  }

  const category = await getExpenseCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <SubPageHeader title={`Editar Categoria: ${category.name}`} />
      <EditCategoryForm category={category} />
    </div>
  );
}