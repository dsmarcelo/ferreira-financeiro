import type { ProductPurchaseInstallmentInsert } from "@/server/db/schema/product-purchase";
import React from "react";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/inputs/date-picker";
import { cn } from "@/lib/utils";

// Accept both full and partial (insert) types for flexibility
interface InstallmentItemFormProps {
  installment: ProductPurchaseInstallmentInsert;
  onFieldChange: (
    field: keyof ProductPurchaseInstallmentInsert,
    value: string | number | boolean | Date | undefined,
  ) => void;
  disabled?: boolean;
}

export default function InstallmentItemForm({
  installment,
  onFieldChange,
  disabled = false,
}: InstallmentItemFormProps) {
  // const [description, setDescription] = React.useState(installment.description);
  return (
    <div
      className={cn(
        "bg-muted/40 flex flex-row gap-2 rounded border p-2",
        disabled && "pointer-events-none opacity-70",
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
        <p className="w-10 text-center font-medium">{`${installment.installmentNumber ?? 1}/${installment.totalInstallments ?? 1}`}</p>
        <Checkbox
          id="isPaid"
          name="isPaid"
          checked={!!installment.isPaid}
          onCheckedChange={(checked: boolean | "indeterminate") =>
            onFieldChange("isPaid", !!checked)
          }
          disabled={disabled}
          className="h-8 w-8"
        />
      </div>
      <div className="flex w-full flex-col justify-between gap-2 sm:flex-row">
        <Input
          type="text"
          id="description"
          name="description"
          placeholder="Descrição"
          className="min-w-32"
          value={installment.description ?? ""}
          onChange={(e) => onFieldChange("description", e.target.value)}
          required
          disabled={disabled}
        />
        <DatePicker
          value={installment.dueDate}
          onChange={(date) => onFieldChange("dueDate", date)}
          name="dueDate"
          required
          shortDate
          className="w-full sm:w-36"
        />
        <CurrencyInput
          name="amount"
          initialValue={installment.amount ? Number(installment.amount) : 0}
          onValueChange={(value) =>
            onFieldChange("amount", value?.toString() ?? "")
          }
          required
          min={0}
          step={0.01}
          className="w-full sm:w-36"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
