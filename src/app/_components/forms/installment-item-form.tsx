// No need to import ExpenseInsert as we're defining our own types
import React from "react";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/inputs/date-picker";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// Define a type for installment items
export type InstallmentItem = {
  description: string;
  amount: string; // Using 'amount' instead of 'value' for UI consistency
  dueDate: Date; // Using 'dueDate' instead of 'date' for UI clarity
  installmentNumber: number;
  totalInstallments: number;
  isPaid: boolean;
};

// Field names that can be changed in an installment
export type InstallmentField = "description" | "amount" | "dueDate" | "isPaid";

interface InstallmentItemFormProps {
  installment: InstallmentItem;
  onFieldChange: (
    field: InstallmentField,
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
        "bg-muted/40 relative flex flex-col rounded-md border p-2",
        disabled && "pointer-events-none opacity-70",
      )}
    >
      <p className="bg-background text-muted-foreground absolute -top-2 left-1 px-1 text-center text-xs font-medium">{`${installment.installmentNumber}/${installment.totalInstallments}`}</p>

      <div className="flex flex-col gap-2">
        <div className="flex w-full flex-col justify-between gap-2 sm:flex-row">
          <Input
            type="text"
            id="description"
            name="description"
            placeholder="Descrição"
            className="bg-background min-w-32"
            value={installment.description}
            onChange={(e) => onFieldChange("description", e.target.value)}
            required
            disabled={disabled}
          />
        </div>

        <div className="flex gap-2">
          <DatePicker
            value={installment.dueDate.toISOString().split("T")[0]}
            onChange={(date) =>
              onFieldChange("dueDate", date ? new Date(date) : undefined)
            }
            name="dueDate"
            required
            shortDate
            className="w-full sm:w-36"
          />

          <CurrencyInput
            name="amount"
            initialValue={Number(installment.amount) || 0}
            onValueChange={(value) =>
              onFieldChange("amount", value?.toString() ?? "0")
            }
            required
            min={0}
            step={0.01}
            className="bg-background w-full"
            disabled={disabled}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isPaid"
              name="isPaid"
              checked={installment.isPaid}
              onCheckedChange={(checked: boolean | "indeterminate") =>
                onFieldChange("isPaid", !!checked)
              }
              disabled={disabled}
            />
            <Label htmlFor="description">Pago</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
