import { Button } from "@/components/ui/button";
import AddExpenseForm from "../../_components/forms/add-expense-form";
import SubPageHeader from "@/app/_components/sub-page-header";

export default async function AddStoreExpensePage() {
  return (
    <>
      <SubPageHeader prevURL="/despesas-loja" />
      <AddExpenseForm source="store" id="add-expense-form-store" />
      <Button
        type="submit"
        form="add-expense-form-store"
        className="rounded-full fixed bottom-24 block w-full px-5"
      >
        Adicionar
      </Button>
    </>
  );
}
