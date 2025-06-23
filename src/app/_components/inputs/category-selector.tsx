"use client";

/**
 * CategorySelector component with form state preservation
 *
 * Features:
 * - Displays available expense categories in a dropdown
 * - "Nova categoria" button navigates to category creation page
 * - Preserves parent form state during navigation using sessionStorage
 * - Automatically selects newly created category upon return
 * - Refreshes category list when window regains focus
 */

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
import { Plus } from "lucide-react";
import { getAllExpenseCategories, getDefaultExpenseCategory } from "@/server/queries/expense-category-queries";
import type { ExpenseCategory } from "@/server/db/schema/expense-category";
import { cn, getCategoryColorClasses } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CategorySelectorProps {
  name: string;
  defaultValue?: number;
  onValueChange?: (value: string) => void;
  required?: boolean;
  onBeforeNavigate?: () => void;
}

export function CategorySelector({
  name,
  defaultValue,
  onValueChange,
  required = false,
  onBeforeNavigate,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    defaultValue ? defaultValue.toString() : ""
  );
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  // Listen for when returning from category creation
  useEffect(() => {
    const handleFocus = () => {
      // Reload categories when window regains focus (user might have created a new category)
      void loadCategories();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Check for newly created category on mount and after categories load
  useEffect(() => {
    const newlyCreatedCategoryId = sessionStorage.getItem('newlyCreatedCategoryId');
    if (newlyCreatedCategoryId && categories.length > 0) {
      // Find the newly created category
      const newCategory = categories.find(cat => cat.id.toString() === newlyCreatedCategoryId);
      if (newCategory) {
        // Select the newly created category
        setSelectedCategoryId(newCategory.id.toString());
        onValueChange?.(newCategory.id.toString());

        // Clear the stored ID
        sessionStorage.removeItem('newlyCreatedCategoryId');
      }
    }
  }, [categories, onValueChange]);

  const selectedCategory = categories.find(
    (cat) => cat.id.toString() === selectedCategoryId
  );

  const handleValueChange = (value: string) => {
    setSelectedCategoryId(value);
    onValueChange?.(value);
  };

  const handleCreateCategory = () => {
    // Call the callback to save form state before navigation
    onBeforeNavigate?.();
    // Navigate to category creation page with return URL
    const currentUrl = window.location.pathname + window.location.search;
    router.push(`/categorias/criar?returnTo=${encodeURIComponent(currentUrl)}`);
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
          onClick={handleCreateCategory}
          className="shrink-0 w-full"
        >
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
            </div>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}