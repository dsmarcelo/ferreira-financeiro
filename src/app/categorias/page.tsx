import { getAllExpenseCategories } from "@/server/queries/expense-category-queries";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import SubPageHeader from "@/app/_components/sub-page-header";
import CategoryEditList from "@/app/_components/lists/category-edit-list";

export default async function CategoriesPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { searchParams } = props;
  const prevURL = (await searchParams).prevURL as string;

  const categories = await getAllExpenseCategories();

  return (
    <div className="container mx-auto max-w-screen-lg">
      <SubPageHeader title="Categorias de Despesas" className="mb-4 px-4" prevURL={prevURL} showBackButton={true} />

      <div className="px-4">
        <div className="mb-6">
          <Button asChild>
            <Link href="/categorias/criar" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Link>
          </Button>
        </div>

        <CategoryEditList categories={categories} />

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhuma categoria encontrada</p>
            <Button asChild>
              <Link href="/categorias/criar">Criar primeira categoria</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}