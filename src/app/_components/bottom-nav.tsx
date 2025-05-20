"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  User,
  Store,
  PackagePlus,
  BanknoteArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Início",
    href: "/",
    icon: House,
    testId: "nav-home",
  },
  {
    label: "Caixa",
    href: "/caixa",
    icon: BanknoteArrowDown,
    testId: "nav-caixa",
  },
  {
    label: "Despesas Pessoais",
    href: "/despesas-pessoais",
    icon: User,
    testId: "nav-pessoal",
  },
  {
    label: "Despesas Loja",
    href: "/despesas-loja",
    icon: Store,
    testId: "nav-loja",
  },
  {
    label: "Compras Produtos",
    href: "/compras-produtos",
    icon: PackagePlus,
    testId: "nav-produtos",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-4 rounded-full bg-white/90 px-2 py-2 shadow-[0_0_20px_0_rgba(0,0,0,0.25)] filter backdrop-blur sm:hidden"
      aria-label="Navegação inferior"
    >
      {navItems.map(({ href, icon: Icon, testId }) => {
        const isActive = href === '/' ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex aspect-square h-12 flex-col items-center justify-center rounded-full transition-colors duration-150 active:bg-slate-300",
              isActive
                ? "bg-slate-900 text-slate-200 shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)]"
                : "bg-transparent",
            )}
            data-testid={testId}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full">
              <Icon
                size={24}
                strokeWidth={2.2}
                className={
                  isActive
                    ? "stroke-slate-200"
                    : "stroke-slate-900 group-hover:stroke-slate-700"
                }
                aria-hidden="true"
              />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
