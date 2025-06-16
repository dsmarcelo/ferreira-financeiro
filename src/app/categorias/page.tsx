import { getAllExpenseCategories } from "@/server/queries/expense-category-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import Link from "next/link";
import { DeleteCategoryButton } from "@/app/_components/buttons/delete-category-button";
import SubPageHeader from "@/app/_components/sub-page-header";

export default async function CategoriesPage() {
  const categories = await getAllExpenseCategories();

  return (
    <div className="container mx-auto px-4 py-6">
      <SubPageHeader title="Categorias de Despesas" />

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
          <Card key={category.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  {category.description && (
                    <CardDescription className="mt-1">
                      {category.description}
                    </CardDescription>
                  )}
                </div>
                {category.id === 1 && (
                  <Badge variant="secondary" className="ml-2">
                    Padrão
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/categorias/editar/${category.id}`} className="flex items-center gap-2">
                    <Edit className="h-3 w-3" />
                    Editar
                  </Link>
                </Button>
                {category.id !== 1 && (
                  <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
                )}
              </div>
            </CardContent>
          </Card>
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
  );
}