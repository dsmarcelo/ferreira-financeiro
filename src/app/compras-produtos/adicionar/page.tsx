"use client";
import AddExpenseForm from "../../_components/forms/add-expense-form";
import SubPageHeader from "@/app/_components/sub-page-header";
import BottomButton from "@/app/_components/buttons/bottom-button";
import { useRouter } from "next/navigation";

export default function AddProductPurchasePage() {
  const router = useRouter();
  return (
    <>
      <SubPageHeader prevURL="/compras-produtos" />
      <AddExpenseForm source="product_purchase" id="add-expense-form-product-purchase" onSuccess={() => router.push("/compras-produtos")} />
      <BottomButton
        type="submit"
        form="add-expense-form-product-purchase"
      >
        Adicionar
      </BottomButton>
    </>
  );
}
