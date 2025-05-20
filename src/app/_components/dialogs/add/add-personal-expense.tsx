"use client";
import AddExpenseSheet from "../../sheets/add-expense-sheet";
import { useMediaQuery } from "usehooks-ts";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AddPersonalExpense({
  children,
}: {
  children?: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? (
    <Link href="/despesas-pessoais/adicionar">
      {children ?? (
        <Button className="rounded-full">Adicionar Despesa Pessoal</Button>
      )}
    </Link>
  ) : (
    <AddExpenseSheet
      source="personal"
      buttonLabel="Adicionar Despesa Pessoal"
    >
      {children}
    </AddExpenseSheet>
  );
}
