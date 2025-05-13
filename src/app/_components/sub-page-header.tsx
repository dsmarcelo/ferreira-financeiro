import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SubPageHeader({
  title,
  prevURL,
  className,
}: {
  title: string;
  prevURL?: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "bg-background/90 sticky top-0 z-50 w-full border-b border-b-gray-100 filter backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto my-auto flex h-12 w-full max-w-screen-lg items-center justify-between gap-4 sm:px-0 md:h-16">
        {prevURL ? (
          <Link href={prevURL} className="flex items-center gap-2">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        ) : (
          <h1 className="text-xl font-bold">{title}</h1>
        )}
      </div>
    </header>
  );
}
