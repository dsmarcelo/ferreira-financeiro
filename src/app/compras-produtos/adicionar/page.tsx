"use client";

import { AddExpenseForm } from "../../_components/forms/add-expense-form";
import SubPageHeader from "@/app/_components/sub-page-header";

export default function AddProductPurchasePage() {
  return (
    <>
      <SubPageHeader title="Adicionar Compra" prevURL="/compras-produtos" />
      <AddExpenseForm source="product_purchase" />
    </>
  );
}
