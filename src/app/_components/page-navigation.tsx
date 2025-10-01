"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PageNavigation() {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex gap-2 rounded-full py-1">
      <Link className="cursor-pointer" href="/vendas">
        <Button
          className="rounded-full"
          variant={pathname === "/vendas" ? "default" : "outline"}
        >
          Vendas
        </Button>
      </Link>
      <Link className="cursor-pointer" href="/entradas">
        <Button
          className="rounded-full"
          variant={pathname === "/entradas" ? "default" : "outline"}
        >
          Entradas
        </Button>
      </Link>
    </div>
  );
}
