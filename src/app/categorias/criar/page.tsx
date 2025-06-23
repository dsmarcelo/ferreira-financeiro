"use client";

import { CreateCategoryForm } from "@/app/_components/forms/create-category-form";
import SubPageHeader from "@/app/_components/sub-page-header";
import { useRouter, useSearchParams } from "next/navigation";
import type { ExpenseCategory } from "@/server/db/schema/expense-category";

export default function CreateCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

    const handleCategoryCreated = (category: ExpenseCategory) => {
    // Store the newly created category ID for potential selection
    if (category.id) {
      sessionStorage.setItem('newlyCreatedCategoryId', category.id.toString());
    }

    // Navigate back to the original form
    if (returnTo) {
      router.push(returnTo);
    } else {
      router.back();
    }
  };

  const handleCancel = () => {
    // Navigate back to the original form without creating a category
    if (returnTo) {
      router.push(returnTo);
    } else {
      router.back();
    }
  };

  return (
    <div className="container mx-auto">
      <SubPageHeader title="Nova Categoria" className="mb-4" />
      <div className="px-4">
        <CreateCategoryForm
          onSuccess={handleCategoryCreated}
          onCancel={handleCancel}
          showCancelButton={true}
        />
      </div>
    </div>
  );
}