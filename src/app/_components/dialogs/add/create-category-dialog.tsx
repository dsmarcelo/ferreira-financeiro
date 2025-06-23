"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateCategoryForm } from "../../forms/create-category-form";
import type { ExpenseCategory } from "@/server/db/schema/expense-category";
import ResponsiveSheet from "../../responsive-sheet";

interface CreateCategoryDialogProps {
  onCategoryCreated?: (category: ExpenseCategory) => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateCategoryDialog({
  onCategoryCreated,
  trigger,
  isOpen: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateCategoryDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled props if provided, otherwise use internal state
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const handleCategoryCreated = (category: ExpenseCategory) => {
    onCategoryCreated?.(category);
    setOpen(false);
  };

  // Only render trigger if provided
  if (trigger === null) {
    return (
      <ResponsiveSheet
        triggerButton={<div style={{ display: 'none' }} />}
        title="Criar Nova Categoria"
        isOpen={open}
        onOpenChange={setOpen}
        maxWidth="sm:max-w-[600px]"
        _enableMobileKeyboardHandling={true}
      >
        <CreateCategoryForm
          onSuccess={handleCategoryCreated}
          showCancelButton={false}
        />
      </ResponsiveSheet>
    );
  }

  return (
    <ResponsiveSheet
      triggerButton={
        trigger ?? <Button variant="outline">Nova Categoria</Button>
      }
      title="Criar Nova Categoria"
      isOpen={open}
      onOpenChange={setOpen}
      maxWidth="sm:max-w-[600px]"
      _enableMobileKeyboardHandling={true}
    >
      <CreateCategoryForm
        onSuccess={handleCategoryCreated}
        showCancelButton={false}
      />
    </ResponsiveSheet>
  );
}
