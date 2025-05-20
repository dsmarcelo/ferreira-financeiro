"use client";
import { Button } from "@/components/ui/button";
import AddExpenseForm from "../../_components/forms/add-expense-form";
import SubPageHeader from "@/app/_components/sub-page-header";
import BottomButton from "@/app/_components/buttons/bottom-button";

export default function AddPersonalExpensePage() {
  return (
    <>
      <SubPageHeader prevURL="/despesas-pessoais" />
      <AddExpenseForm source="personal" id="add-expense-form-personal" />
      <BottomButton
        type="submit"
        form="add-expense-form-personal"
      >
        Adicionar
      </BottomButton>
    </>
  );
}
