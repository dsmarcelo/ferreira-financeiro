"use client";

// Thin wrapper to reuse the existing income form under a sales name
import type { ComponentProps } from "react";
import EditIncomeForm from "@/app/_components/forms/edit-income-form";

export default function EditSaleForm(props: ComponentProps<typeof EditIncomeForm>) {
  return <EditIncomeForm {...props} />;
}
