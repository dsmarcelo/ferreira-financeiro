"use client";
import AddExpenseSheet from "../../sheets/add-expense-sheet";
import { useMediaQuery } from "usehooks-ts";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AddStoreExpense({
  children,
}: {
  children?: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? (
    <Link href="/despesas-loja/adicionar">
      {children ?? (
        <Button className="rounded-full">Adicionar Despesa da Loja</Button>
      )}
    </Link>
  ) : (
    <AddExpenseSheet
      source="store"
      buttonLabel="Adicionar Despesa da Loja"
    >
      {children}
    </AddExpenseSheet>
  );
}
