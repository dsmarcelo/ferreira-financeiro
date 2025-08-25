"use client";

import AddIncomeSheet from "../../sheets/add-income-sheet";
// import { useMediaQuery } from "usehooks-ts";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AddIncomeProps {
  children?: React.ReactNode;
}

export default function AddIncome({ children }: AddIncomeProps) {
  // const isMobile = useMediaQuery("(max-width: 768px)");
  const isMobile = true;

  return isMobile ? (
    <Link href="/caixa/adicionar">
      {children ?? <Button className="rounded-full">Adicionar Receita</Button>}
    </Link>
  ) : (
    <AddIncomeSheet buttonLabel="Adicionar Entrada">{children}</AddIncomeSheet>
  );
}
