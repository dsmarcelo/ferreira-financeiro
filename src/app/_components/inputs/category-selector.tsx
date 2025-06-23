"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryBadge } from "@/components/ui/category-badge";
import { Plus, Settings } from "lucide-react";
import { getAllExpenseCategories, getDefaultExpenseCategory } from "@/server/queries/expense-category-queries";
import type { ExpenseCategory } from "@/server/db/schema/expense-category";
import Link from "next/link";
import { cn, getCategoryColorClasses } from "@/lib/utils";
import { CreateCategoryDialog } from "../dialogs/add/create-category-dialog";

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  useEffect(() => {
    void loadCategories();
  }, [defaultValue]);

  const selectedCategory = categories.find(
    (cat) => cat.id.toString() === selectedCategoryId
  );

  const handleValueChange = (value: string) => {
    setSelectedCategoryId(value);
    onValueChange?.(value);
  };

  const handleCategoryCreated = (category: ExpenseCategory) => {
    // Add the new category to the list
    setCategories(prev => [...prev, category]);
    // Select the newly created category
    setSelectedCategoryId(category.id.toString());
    onValueChange?.(category.id.toString());
    // Close the create dialog
    setIsCreateDialogOpen(false);
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
          <SelectTrigger className="flex-1">
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
                <div className={cn("flex items-center gap-2 px-2 rounded-md", getCategoryColorClasses(category.color))}>
                  <span className="text-sm">{category.emoji}</span>
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
            <SelectSeparator />
            <div className="p-2">
            <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsCreateDialogOpen(true)}
          className="shrink-0 w-full"
        >
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
            </div>
          </SelectContent>
        </Select>
      </div>

      <CreateCategoryDialog
        onCategoryCreated={handleCategoryCreated}
        trigger={null}
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}