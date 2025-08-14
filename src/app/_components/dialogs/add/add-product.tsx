"use client";

import AddProductSheet from "../../sheets/add-product-sheet";
import { useMediaQuery } from "usehooks-ts";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AddProduct({ children }: { children?: React.ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? (
    <Link href="/estoque/adicionar">
      {children ?? <Button className="rounded-full">Adicionar Produto</Button>}
    </Link>
  ) : (
    <AddProductSheet buttonLabel="Adicionar Produto">{children}</AddProductSheet>
  );
}


