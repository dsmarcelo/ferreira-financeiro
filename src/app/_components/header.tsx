"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import DateRangePicker from "./date-range-picker";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import UserMenu from "./user-menu";
import {
  ArrowLeft,
  House,
  BanknoteArrowDown,
  User,
  Store,
  Package,
} from "lucide-react";
export default function Header({
  children,
  showBackButton = false,
  className,
  showDatePicker = true,
  showUserMenu = false,
}: {
  children?: React.ReactNode;
  showBackButton?: boolean;
  className?: string;
  showDatePicker?: boolean;
  showUserMenu?: boolean;
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
      label: "Pessoais",
      href: "/despesas-pessoais",
      icon: User,
      testId: "nav-pessoal",
    },
    {
      label: "Loja",
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
  return (
    <header
      className={cn(
        "bg-background/90 sticky top-0 z-50 w-full border-b border-b-gray-100 px-5 filter backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto my-auto flex h-12 w-full max-w-screen-xl items-center justify-between gap-4 md:h-16">
        <nav className="hidden items-center gap-0 sm:flex">
          {navItems.map(({ href, icon: Icon, testId, label }) => {
            const isActive =
              href === "/" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex h-10 items-center justify-center rounded-full transition-colors duration-150 active:bg-slate-300",
                  isActive
                    ? "bg-slate-900 text-slate-200 shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)]"
                    : "bg-transparent hover:bg-slate-100",
                )}
                data-testid={testId}
              >
                <div className="flex items-center gap-2 px-3 py-1">
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
                  <p className="hidden text-sm lg:block">{label}</p>
                </div>
              </Link>
            );
          })}
        </nav>
        {showBackButton && (
          <Button size="lg" variant="ghost" onClick={() => router.back()}>
            <ArrowLeft />
            Voltar
          </Button>
        )}{" "}
        {showDatePicker && (
          <div className="w-full sm:w-fit">
            <DateRangePicker />
          </div>
        )}
        {showUserMenu && <UserMenu />}
        {children}
      </div>
    </header>
  );
}
