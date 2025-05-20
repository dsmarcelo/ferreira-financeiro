"use client";
import AddExpenseForm from "../../_components/forms/add-expense-form";
import SubPageHeader from "@/app/_components/sub-page-header";
import BottomButton from "@/app/_components/buttons/bottom-button";

export default function AddProductPurchasePage() {
  return (
    <>
      <SubPageHeader prevURL="/compras-produtos" />
      <AddExpenseForm source="product_purchase" id="add-expense-form-product-purchase" />
      <BottomButton
        type="submit"
        form="add-expense-form-product-purchase"
      >
        Adicionar
      </BottomButton>
    </>
  );
}
