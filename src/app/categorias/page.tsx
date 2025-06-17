import { getAllExpenseCategories } from "@/server/queries/expense-category-queries";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit } from "lucide-react";
import Link from "next/link";
import SubPageHeader from "@/app/_components/sub-page-header";
import { getCategoryColorClasses } from "@/lib/utils";

export default async function CategoriesPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { searchParams } = props;
  const prevURL = (await searchParams).prevURL as string;

  const categories = await getAllExpenseCategories();

  return (
    <div className="container mx-auto">
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link href={`/categorias/editar/${category.id}`} key={category.id} className="hover:opacity-80">
            <Card className={`relative ${getCategoryColorClasses(category.color)}`}>
              <div className="flex items-center gap-2 absolute top-4 right-4">
                <Edit className="h-3 w-3" />
              </div>
              <CardHeader className="p-2 px-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    {category.description && (
                      <CardDescription>
                        {category.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
            </Link>
          ))}
        </div>

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