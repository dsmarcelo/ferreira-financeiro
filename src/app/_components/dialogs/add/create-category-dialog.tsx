"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateCategoryForm } from "../../forms/create-category-form";
import type { ExpenseCategory } from "@/server/db/schema/expense-category";
import ResponsiveSheet from "../../responsive-sheet";

interface CreateCategoryDialogProps {
  onCategoryCreated?: (category: ExpenseCategory) => void;
  trigger?: React.ReactNode;
}

export function CreateCategoryDialog({
  onCategoryCreated,
  trigger
}: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);

  const handleCategoryCreated = (category: ExpenseCategory) => {
    onCategoryCreated?.(category);
    setOpen(false);
  };

  return (
    <ResponsiveSheet
      triggerButton={trigger ?? <Button variant="outline">Nova Categoria</Button>}
      title="Criar Nova Categoria"
      description="Crie uma nova categoria para organizar suas despesas."
      isOpen={open}
      onOpenChange={setOpen}
      maxWidth="sm:max-w-[600px]"
      _enableMobileKeyboardHandling={true}
    >
      <CreateCategoryForm onSuccess={handleCategoryCreated} showCancelButton={false} />
    </ResponsiveSheet>
  );
}