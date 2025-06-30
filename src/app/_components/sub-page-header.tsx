"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SubPageHeader({
  title,
  prevURL,
  className,
  showBackButton = true,
}: {
  title?: string;
  prevURL?: string;
  className?: string;
  showBackButton?: boolean;
}) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "bg-background/90 sticky top-0 z-50 w-full border-b border-b-gray-100 filter backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto my-auto flex h-12 w-full max-w-screen-lg items-center gap-4 sm:px-0 md:h-16">
        {prevURL ? (
          <Link href={prevURL} className="flex items-center gap-2">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        ) : showBackButton ? (
            <Button onClick={() => router.back()} variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
        ) : null}
        <h1 className="text-xl font-bold leading-none">{title}</h1>
      </div>
    </header>
  );
}
