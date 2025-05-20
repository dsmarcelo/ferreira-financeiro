"use client";
import AddExpenseForm from "../../_components/forms/add-expense-form";
import SubPageHeader from "@/app/_components/sub-page-header";
import BottomButton from "@/app/_components/buttons/bottom-button";
import { useRouter } from "next/navigation";

export default function AddPersonalExpensePage() {
  const router = useRouter();
  return (
    <>
      <SubPageHeader prevURL="/despesas-pessoais" />
      <AddExpenseForm source="personal" id="add-expense-form-personal" onSuccess={() => router.push("/despesas-pessoais")} />
      <BottomButton
        type="submit"
        form="add-expense-form-personal"
      >
        Adicionar
      </BottomButton>
    </>
  );
}
