"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/inputs/date-picker";
import { formatCurrency } from "@/lib/utils";
import type { ProductPurchaseInstallmentInsert } from "@/server/db/schema/product-purchase";
import { cn } from "@/lib/utils";

interface InstallmentFormProps {
  installments: ProductPurchaseInstallmentInsert[];
  onChange: (installments: ProductPurchaseInstallmentInsert[]) => void;
  disabled?: boolean;
}

export default function InstallmentsForm({
  installments,
  onChange,
  disabled = false,
}: InstallmentFormProps) {
  const handleFieldChange = (
    idx: number,
    field: keyof ProductPurchaseInstallmentInsert,
    value: string | number | boolean | Date,
  ) => {
    const updated = installments.map((inst, i) =>
      i === idx ? { ...inst, [field]: value } : inst,
    );
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      {installments.map((inst, idx) => (
        <div
          key={idx}
          className={cn(
            "rounded border p-3 flex flex-col gap-2 bg-muted/40",
            disabled && "opacity-70 pointer-events-none",
          )}
        >
          <div className="flex gap-2 items-center">
            <Label className="min-w-[80px]">Parcela {idx + 1}</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={inst.amount}
              onChange={(e) =>
                handleFieldChange(idx, "amount", Number(e.target.value).toFixed(2))
              }
              className="max-w-[120px]"
              aria-label={`Valor da parcela ${idx + 1}`}
              disabled={disabled}
            />
            <span className="text-xs text-muted-foreground">
              {formatCurrency(Number(inst.amount))}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <Label className="min-w-[80px]">Vencimento</Label>
            <DatePicker
              id={`dueDate-${idx}`}
              name={`dueDate-${idx}`}
              defaultValue={inst.dueDate}
              onChange={(date: string) => handleFieldChange(idx, "dueDate", date)}
              required
              disabled={disabled}
            />
          </div>
          <div className="flex gap-2 items-center">
            <Label className="min-w-[80px]">Descrição</Label>
            <Input
              type="text"
              value={inst.description}
              onChange={(e) =>
                handleFieldChange(idx, "description", e.target.value)
              }
              aria-label={`Descrição da parcela ${idx + 1}`}
              disabled={disabled}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
