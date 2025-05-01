"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import DateRangePicker from "./date-picker";
import { cn } from "@/lib/utils";
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
  return (
    <header
      className={cn(
        "bg-background/90 w-full border-b border-b-gray-100 filter backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto my-auto flex h-12 w-full max-w-screen-lg items-center justify-between gap-4 md:h-16">
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
