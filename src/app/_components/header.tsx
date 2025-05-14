"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import DateRangePicker from "./date-range-picker";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  House,
  BanknoteArrowDown,
  User,
  Store,
  PackagePlus,
} from "lucide-react";
export default function Header({
  children,
  showBackButton = false,
  className,
}: {
  children?: React.ReactNode;
  showBackButton?: boolean;
  className?: string;
}) {
  const router = useRouter();

  const pathname = usePathname();

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
  return (
    <header
      className={cn(
        "bg-background/90 sticky top-0 z-50 w-full border-b border-b-gray-100 px-5 filter backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto my-auto flex h-12 w-full max-w-screen-lg items-center justify-between gap-4 md:h-16">
        <nav className="hidden items-center gap-2 sm:flex">
          {navItems.map(({ href, icon: Icon, testId }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex aspect-square h-10 flex-col items-center justify-center rounded-full transition-colors duration-150 active:bg-slate-300",
                  isActive
                    ? "bg-slate-900 text-slate-200 shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)]"
                    : "bg-transparent",
                )}
                data-testid={testId}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full">
                  <Icon
                    size={18}
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
        {showBackButton && (
          <Button size="lg" variant="ghost" onClick={() => router.back()}>
            <ArrowLeft />
            Voltar
          </Button>
        )}
        <div className="w-full sm:w-fit">
          <DateRangePicker />
        </div>
        {children}
      </div>
    </header>
  );
}
