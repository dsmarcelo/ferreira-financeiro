"use client";

import AddSaleSheet from "../../sheets/add-sale-sheet";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AddSaleProps {
  children?: React.ReactNode;
}

export default function AddSale({ children }: AddSaleProps) {
  const isMobile = true; // follow same pattern as AddIncome

  return isMobile ? (
    <Link href="/vendas/adicionar">
      {children ?? <Button className="rounded-full">Adicionar Venda</Button>}
    </Link>
  ) : (
    <AddSaleSheet buttonLabel="Adicionar Venda">{children}</AddSaleSheet>
  );
}

