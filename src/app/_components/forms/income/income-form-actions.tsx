import { Button } from "@/components/ui/button";

interface IncomeFormActionsProps {
  formId?: string;
  pending: boolean;
}

export function IncomeFormActions({ formId, pending }: IncomeFormActionsProps) {
  return (
    <>
      {!formId && (
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      )}
    </>
  );
}


