"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { DatePicker } from "./date-picker";
import { cn } from "@/lib/utils";
export default function Header({
  children,
  showBackButton = true,
  className,
}: {
  children?: React.ReactNode;
  showBackButton?: boolean;
  className?: string;
}) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "bg-background-secondary flex h-12 w-full items-center justify-center",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-screen-lg items-center justify-between gap-4">
        {showBackButton && (
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft />
            Voltar
          </Button>
        )}
        <div className="hidden sm:block">
          <DatePicker />
        </div>
        {children}
      </div>
    </header>
  );
}
