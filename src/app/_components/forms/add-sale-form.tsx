"use client";

// Thin wrapper to reuse the existing income form under a sales name
import type { ComponentProps } from "react";
import AddIncomeForm from "@/app/_components/forms/add-income-form";

export default function AddSaleForm(props: ComponentProps<typeof AddIncomeForm>) {
  return <AddIncomeForm {...props} />;
}
