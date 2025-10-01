"use client";

import EditIncomeSheet from "../../sheets/edit-income-sheet";
import { useMediaQuery } from "usehooks-ts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Income } from "@/server/db/schema/incomes-schema";

interface EditIncomeProps {
  data: Income;
  children?: React.ReactNode;
}

export default function EditIncome({ data, children }: EditIncomeProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? (
    <Link href={`/entradas/editar/${data.id}`}>
      {children ?? (
        <Button className="rounded-full">Editar Entrada</Button>
      )}
    </Link>
  ) : (
    <EditIncomeSheet income={data}>
      {children}
    </EditIncomeSheet>
  );
}
