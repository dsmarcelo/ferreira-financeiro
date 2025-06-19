"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryBadge } from "@/components/ui/category-badge";
import { Plus, Settings } from "lucide-react";
import { getAllExpenseCategories, getDefaultExpenseCategory } from "@/server/queries/expense-category-queries";
import type { ExpenseCategory } from "@/server/db/schema/expense-category";
import Link from "next/link";

interface CategorySelectorProps {
  name: string;
  defaultValue?: number;
  onValueChange?: (value: string) => void;
  required?: boolean;
}

export function CategorySelector({
  name,
  defaultValue,
  onValueChange,
  required = false,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    defaultValue ? defaultValue.toString() : ""
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await getAllExpenseCategories();
        setCategories(fetchedCategories);

        // If no default value provided, use the default category from database
        if (!defaultValue && fetchedCategories.length > 0) {
          const defaultCategory = await getDefaultExpenseCategory();
          if (defaultCategory) {
            setSelectedCategoryId(defaultCategory.id.toString());
          } else {
            // Fallback to first category if no default is set
            const firstCategory = fetchedCategories[0];
            if (firstCategory) {
              setSelectedCategoryId(firstCategory.id.toString());
            }
          }
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCategories();
  }, [defaultValue]);

  const selectedCategory = categories.find(
    (cat) => cat.id.toString() === selectedCategoryId
  );

  const handleValueChange = (value: string) => {
    setSelectedCategoryId(value);
    onValueChange?.(value);
  };

  if (isLoading) {
    return <div className="h-10 bg-gray-100 animate-pulse rounded-md" />;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select
          name={name}
          value={selectedCategoryId}
          onValueChange={handleValueChange}
          required={required}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma categoria">
              {selectedCategory && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{selectedCategory.emoji}</span>
                  <span>{selectedCategory.name}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{category.emoji}</span>
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Link href="/categorias" passHref>
          <Button type="button" variant="outline" size="icon" title="Gerenciar categorias">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>

        <Link href="/categorias/criar" passHref>
          <Button type="button" variant="outline" size="icon" title="Criar nova categoria">
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {selectedCategory && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Categoria selecionada:</span>
          <CategoryBadge
            color={selectedCategory.color}
            name={selectedCategory.name}
            emoji={selectedCategory.emoji}
          />
        </div>
      )}
    </div>
  );
}