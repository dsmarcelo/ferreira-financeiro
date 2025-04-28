import { Loader2 } from "lucide-react";

// This component is shown while the page is loading async data (including searchParams)
export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {/* Spinner icon from lucide-react, animated with Tailwind */}
      <Loader2 className="text-primary mb-4 h-10 w-10 animate-spin" />
      <span className="text-muted-foreground text-lg font-medium">
        Carregando...
      </span>
    </main>
  );
}
