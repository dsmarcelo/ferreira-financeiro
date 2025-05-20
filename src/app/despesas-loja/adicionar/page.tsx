"use client";
import AddExpenseForm from "../../_components/forms/add-expense-form";
import SubPageHeader from "@/app/_components/sub-page-header";
import BottomButton from "@/app/_components/buttons/bottom-button";

export default function AddStoreExpensePage() {
  return (
    <>
      <SubPageHeader prevURL="/despesas-loja" />
      <AddExpenseForm source="store" id="add-expense-form-store" />
      <BottomButton
        type="submit"
        form="add-expense-form-store"
      >
        Adicionar
      </BottomButton>
    </>
  );
}
