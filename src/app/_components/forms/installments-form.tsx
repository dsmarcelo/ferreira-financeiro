"use client";

import InstallmentItemForm from "./installment-item-form";
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
    <div>
      <div className="mb-2 hidden gap-2 px-2 text-center sm:flex">
        <div className="w-10">
          <p className="w-10">n°</p>
        </div>
        <p className="w-fit">Pago</p>
        <p className="w-full">Descrição</p>
        <div className="flex gap-2">
          <p className="w-36">Vencimento</p>
          <p className="w-36">Valor</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {installments.map((inst, idx) => (
          <div key={idx}>
            <InstallmentItemForm
              installment={inst}
              onFieldChange={(field, value) => {
                // Only pass value if defined, fallback to empty string/false/0 as appropriate
                let castValue: string | number | boolean | Date = value ?? "";
                if (field === "isPaid") castValue = Boolean(value);
                else if (
                  field === "amount" ||
                  field === "installmentNumber" ||
                  field === "totalInstallments"
                )
                  castValue = Number(value) || 0;
                else if (field === "dueDate" && typeof value === "string")
                  castValue = value;
                else if (field === "description")
                  castValue = String(value ?? "");
                handleFieldChange(idx, field, castValue);
              }}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
