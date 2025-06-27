"use client";
import AddExpenseDialog from "../../sheets/add-expense-sheet";
import { useMediaQuery } from "usehooks-ts";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AddProductPurchase({
  children,
}: {
  children?: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? (
    <Link href="/compras-produtos/adicionar">
      {children ?? (
        <Button className="rounded-full">Adicionar Compra de Produto</Button>
      )}
    </Link>
  ) : (
    <AddExpenseDialog
      source="product_purchase"
      buttonLabel="Adicionar Compra de Produto"
    >
      {children}
    </AddExpenseDialog>
  );
}
