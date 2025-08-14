"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  User,
  Store,
  BanknoteArrowDown,
  Package,
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
    label: "Estoque",
    href: "/estoque",
    icon: Package,
    testId: "nav-estoque",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white to-transparent pb-6 px-5 sm:hidden">
      <nav
        className="mx-5 flex justify-between max-w-[400px] gap-2 rounded-full bg-white/90 px-1 py-1 shadow-[0_0_20px_0_rgba(0,0,0,0.25)] filter backdrop-blur"
        style={{ marginLeft: 'auto', marginRight: 'auto' }}
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
                "group flex w-full h-14 flex-col items-center justify-center rounded-full transition-colors duration-150 active:bg-slate-300",
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
    </div>
  );
}
